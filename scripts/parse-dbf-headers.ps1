# Le o cabecalho binario de arquivos .DBF (formato dBase/Clipper) e extrai a
# lista de campos (nome, tipo, tamanho, decimais) sem precisar de nenhuma
# ferramenta externa. Gera um dicionario de dados em Markdown.
#
# Uso: .\parse-dbf-headers.ps1 -Path "..\sistema" -OutFile "..\docs\LEGACY-DATA-DICTIONARY.md"

param(
    [string]$Path = "$PSScriptRoot\..\sistema",
    [string]$OutFile = "$PSScriptRoot\..\docs\LEGACY-DATA-DICTIONARY.md"
)

function Get-DbfFields {
    param([string]$FilePath)

    $bytes = [System.IO.File]::ReadAllBytes($FilePath)
    if ($bytes.Length -lt 32) { return $null }

    $version = $bytes[0]
    $numRecords = [BitConverter]::ToUInt32($bytes, 4)
    $headerLen = [BitConverter]::ToUInt16($bytes, 8)
    $recordLen = [BitConverter]::ToUInt16($bytes, 10)

    $fields = @()
    $offset = 32
    while ($offset -lt $headerLen - 1 -and $bytes[$offset] -ne 0x0D) {
        $nameBytes = $bytes[$offset..($offset + 10)]
        $nullIndex = [Array]::IndexOf($nameBytes, [byte]0)
        if ($nullIndex -eq 0) {
            $name = ""
        }
        elseif ($nullIndex -gt 0) {
            $name = ([System.Text.Encoding]::ASCII.GetString($nameBytes[0..($nullIndex - 1)])).Trim()
        }
        else {
            $name = ([System.Text.Encoding]::ASCII.GetString($nameBytes)).Trim()
        }
        $type = [char]$bytes[$offset + 11]
        $length = $bytes[$offset + 16]
        $decimals = $bytes[$offset + 17]

        $fields += [PSCustomObject]@{
            Name     = $name
            Type     = $type
            Length   = $length
            Decimals = $decimals
        }
        $offset += 32
    }

    return [PSCustomObject]@{
        Version    = $version
        NumRecords = $numRecords
        HeaderLen  = $headerLen
        RecordLen  = $recordLen
        Fields     = $fields
    }
}

$dbfFiles = Get-ChildItem -Path $Path -Filter *.dbf | Sort-Object Name

$md = New-Object System.Collections.Generic.List[string]
$md.Add("# Dicionario de Dados - Sistema Legado (DOS/Clipper)")
$md.Add("")
$md.Add("> Gerado automaticamente a partir dos cabecalhos binarios dos arquivos .DBF em sistema/.")
$md.Add("> Tipos: C=Char, N=Numeric, D=Date, L=Logical, M=Memo.")
$md.Add("")
$md.Add("Total de tabelas: $($dbfFiles.Count)")
$md.Add("")

foreach ($file in $dbfFiles) {
    try {
        $info = Get-DbfFields -FilePath $file.FullName
        if (-not $info) { continue }

        $md.Add("## $($file.Name)")
        $md.Add("")
        $md.Add("- Registros: $($info.NumRecords)")
        $md.Add("- Tamanho do registro: $($info.RecordLen) bytes")
        $md.Add("")
        $md.Add("| Campo | Tipo | Tamanho | Decimais |")
        $md.Add("|---|---|---|---|")
        foreach ($f in $info.Fields) {
            $md.Add("| $($f.Name) | $($f.Type) | $($f.Length) | $($f.Decimals) |")
        }
        $md.Add("")
    }
    catch {
        $md.Add("## $($file.Name)")
        $md.Add("")
        $md.Add("> Erro ao ler cabecalho: $_")
        $md.Add("")
    }
}

$outDir = Split-Path $OutFile -Parent
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
$md -join "`r`n" | Out-File -FilePath $OutFile -Encoding ASCII

Write-Host "Dicionario de dados gerado em: $OutFile"
Write-Host "Tabelas processadas: $($dbfFiles.Count)"

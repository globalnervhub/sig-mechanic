module.exports = {
  apps: [
    {
      name: 'sig-mechanic-backend',
      cwd: '/opt/sig-mechanic/apps/backend',
      script: 'dist/src/main.js',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '400M',
    },
    {
      name: 'sig-mechanic-frontend',
      cwd: '/opt/sig-mechanic/apps/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '400M',
    },
  ],
};

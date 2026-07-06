SELECT table_name FROM information_schema.tables WHERE table_name IN ('vehicle_brands','vehicle_models','oil_change_records');
SELECT column_name FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name IN ('brand','model','brand_id','model_id');

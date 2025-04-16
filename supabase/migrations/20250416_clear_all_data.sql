
-- Clear all data from all tables in the database while preserving table structures
-- First disable triggers to avoid any cascading issues
SET session_replication_role = 'replica';

-- Clear the data from each table
TRUNCATE TABLE tote_inbound RESTART IDENTITY CASCADE;
TRUNCATE TABLE tote_staging RESTART IDENTITY CASCADE;
TRUNCATE TABLE tote_outbound RESTART IDENTITY CASCADE;
TRUNCATE TABLE grid_master RESTART IDENTITY CASCADE;
TRUNCATE TABLE facility_master RESTART IDENTITY CASCADE;

-- Don't clear users_log as it contains authentication information
-- If you want to clear users (except admin), you can use:
-- DELETE FROM users_log WHERE role != 'Admin';

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Add a log entry to show the cleanup was performed
INSERT INTO facility_master (name, type, location)
VALUES ('Main Facility', 'Warehouse', 'New York');

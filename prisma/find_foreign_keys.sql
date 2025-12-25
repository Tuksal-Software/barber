-- Find all foreign key constraint names
-- Run this FIRST to see actual constraint names in your database

SELECT
  CONSTRAINT_NAME,
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND REFERENCED_TABLE_NAME IS NOT NULL
  AND TABLE_NAME IN ('appointment_requests', 'ledger_entries', 'barbers', 'appointment_slots', 'working_hours')
ORDER BY TABLE_NAME, CONSTRAINT_NAME;


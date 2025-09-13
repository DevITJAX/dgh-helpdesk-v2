-- Schema validation queries for DGH HelpDesk System
-- These queries can be used to validate the database schema

-- Check if all required tables exist
SELECT 
    CASE 
        WHEN COUNT(*) = 5 THEN 'PASS: All required tables exist'
        ELSE 'FAIL: Missing tables'
    END as table_check
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'PUBLIC' 
AND TABLE_NAME IN ('USERS', 'EQUIPMENT', 'TICKETS', 'TICKET_COMMENTS', 'ACTIVITY_LOGS');

-- Check Users table structure
SELECT 
    CASE 
        WHEN COUNT(*) >= 10 THEN 'PASS: Users table has required columns'
        ELSE 'FAIL: Users table missing columns'
    END as users_table_check
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'PUBLIC' 
AND TABLE_NAME = 'USERS'
AND COLUMN_NAME IN ('ID', 'LDAP_USERNAME', 'EMAIL', 'FULL_NAME', 'DEPARTMENT', 'ROLE', 'IS_ACTIVE', 'CREATED_AT', 'UPDATED_AT', 'LAST_LOGIN');

-- Check Equipment table structure
SELECT 
    CASE 
        WHEN COUNT(*) >= 15 THEN 'PASS: Equipment table has required columns'
        ELSE 'FAIL: Equipment table missing columns'
    END as equipment_table_check
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'PUBLIC' 
AND TABLE_NAME = 'EQUIPMENT'
AND COLUMN_NAME IN ('ID', 'HOSTNAME', 'IP_ADDRESS', 'MAC_ADDRESS', 'EQUIPMENT_TYPE', 'MANUFACTURER', 'MODEL', 'OS_NAME', 'LOCATION', 'STATUS', 'LAST_SEEN', 'IS_MANAGED', 'CREATED_AT', 'UPDATED_AT', 'SPECIFICATIONS');

-- Check Tickets table structure
SELECT 
    CASE 
        WHEN COUNT(*) >= 10 THEN 'PASS: Tickets table has required columns'
        ELSE 'FAIL: Tickets table missing columns'
    END as tickets_table_check
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'PUBLIC' 
AND TABLE_NAME = 'TICKETS'
AND COLUMN_NAME IN ('ID', 'TITLE', 'DESCRIPTION', 'PRIORITY', 'STATUS', 'CATEGORY', 'CREATED_BY', 'ASSIGNED_TO', 'EQUIPMENT_ID', 'CREATED_AT', 'UPDATED_AT', 'RESOLVED_AT');

-- Check Ticket Comments table structure
SELECT 
    CASE 
        WHEN COUNT(*) >= 6 THEN 'PASS: Ticket Comments table has required columns'
        ELSE 'FAIL: Ticket Comments table missing columns'
    END as comments_table_check
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'PUBLIC' 
AND TABLE_NAME = 'TICKET_COMMENTS'
AND COLUMN_NAME IN ('ID', 'TICKET_ID', 'USER_ID', 'COMMENT', 'IS_INTERNAL', 'CREATED_AT', 'COMMENT_TYPE');

-- Check foreign key constraints
SELECT 
    CASE 
        WHEN COUNT(*) >= 4 THEN 'PASS: Required foreign keys exist'
        ELSE 'FAIL: Missing foreign key constraints'
    END as foreign_key_check
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = 'PUBLIC' 
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND (TABLE_NAME = 'TICKETS' OR TABLE_NAME = 'TICKET_COMMENTS');

-- Check indexes for performance
SELECT 
    CASE 
        WHEN COUNT(*) >= 5 THEN 'PASS: Performance indexes exist'
        ELSE 'WARN: Some performance indexes may be missing'
    END as index_check
FROM INFORMATION_SCHEMA.INDEXES 
WHERE TABLE_SCHEMA = 'PUBLIC'
AND (INDEX_NAME LIKE 'IDX_%' OR INDEX_NAME LIKE 'UK_%');

-- Validate data integrity
-- Check for orphaned tickets (tickets without valid created_by user)
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'PASS: No orphaned tickets found'
        ELSE CONCAT('WARN: ', COUNT(*), ' tickets have invalid created_by references')
    END as ticket_integrity_check
FROM TICKETS t
LEFT JOIN USERS u ON t.CREATED_BY = u.ID
WHERE u.ID IS NULL;

-- Check for orphaned ticket comments
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'PASS: No orphaned ticket comments found'
        ELSE CONCAT('WARN: ', COUNT(*), ' comments have invalid ticket or user references')
    END as comment_integrity_check
FROM TICKET_COMMENTS tc
LEFT JOIN TICKETS t ON tc.TICKET_ID = t.ID
LEFT JOIN USERS u ON tc.USER_ID = u.ID
WHERE t.ID IS NULL OR u.ID IS NULL;

-- Check for equipment without valid location or type
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'PASS: All equipment has valid type'
        ELSE CONCAT('WARN: ', COUNT(*), ' equipment records have null equipment_type')
    END as equipment_type_check
FROM EQUIPMENT 
WHERE EQUIPMENT_TYPE IS NULL;

-- Check user role distribution
SELECT 
    ROLE,
    COUNT(*) as user_count,
    CASE 
        WHEN ROLE = 'ADMIN' AND COUNT(*) >= 1 THEN 'PASS: Admin users exist'
        WHEN ROLE = 'TECHNICIAN' AND COUNT(*) >= 1 THEN 'PASS: Technician users exist'
        WHEN ROLE = 'EMPLOYEE' AND COUNT(*) >= 1 THEN 'PASS: Employee users exist'
        ELSE 'INFO: Role distribution'
    END as role_check
FROM USERS 
WHERE IS_ACTIVE = true
GROUP BY ROLE;

-- Check ticket status distribution
SELECT 
    STATUS,
    COUNT(*) as ticket_count
FROM TICKETS 
GROUP BY STATUS
ORDER BY COUNT(*) DESC;

-- Check equipment status distribution
SELECT 
    STATUS,
    COUNT(*) as equipment_count
FROM EQUIPMENT 
GROUP BY STATUS
ORDER BY COUNT(*) DESC;

-- Performance check: Identify tables that might need optimization
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CASE 
        WHEN TABLE_ROWS > 10000 THEN 'WARN: Large table, consider archiving old data'
        WHEN TABLE_ROWS > 1000 THEN 'INFO: Medium table size'
        ELSE 'PASS: Small table size'
    END as size_check
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'PUBLIC' 
AND TABLE_TYPE = 'BASE TABLE'
AND TABLE_NAME IN ('USERS', 'EQUIPMENT', 'TICKETS', 'TICKET_COMMENTS', 'ACTIVITY_LOGS');

-- Check Activity Logs table structure
SELECT 
    CASE 
        WHEN COUNT(*) >= 14 THEN 'PASS: Activity Logs table has required columns'
        ELSE 'FAIL: Activity Logs table missing columns'
    END as activity_logs_table_check
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'PUBLIC' 
AND TABLE_NAME = 'ACTIVITY_LOGS'
AND COLUMN_NAME IN ('ID', 'TIMESTAMP', 'USER_IDENTIFIER', 'ACTION', 'DETAILS', 'SEVERITY', 'IP_ADDRESS', 'USER_AGENT', 'SESSION_ID', 'AFFECTED_RESOURCE', 'OLD_VALUE', 'NEW_VALUE', 'DEPARTMENT', 'LOCATION');

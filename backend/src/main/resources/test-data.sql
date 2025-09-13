-- Test Data for DGH HelpDesk System
-- This script creates test users and tickets to verify ticket visibility and creation permissions

-- Clear existing test data (optional - uncomment if needed)
-- DELETE FROM ticket_comments WHERE ticket_id IN (SELECT id FROM tickets WHERE created_by IN (SELECT id FROM users WHERE ldap_username LIKE 'test_%'));
-- DELETE FROM tickets WHERE created_by IN (SELECT id FROM users WHERE ldap_username LIKE 'test_%');
-- DELETE FROM users WHERE ldap_username LIKE 'test_%';

-- Insert test users with different roles
INSERT INTO users (ldap_username, email, full_name, department, role, is_active, phone_number, office_location, created_at, updated_at) 
VALUES 
-- Admin users (can see all tickets)
('test_admin', 'test.admin@dgh.gov.ma', 'Test Administrator', 'IT Department', 'ADMIN', true, '+212-5-22-123456', 'Building A, Floor 2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('test_admin2', 'test.admin2@dgh.gov.ma', 'Test Admin Assistant', 'IT Department', 'ADMIN', true, '+212-5-22-123457', 'Building A, Floor 2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Technician users (can see assigned tickets and all tickets)
('test_tech1', 'test.tech1@dgh.gov.ma', 'Test Technician 1', 'IT Department', 'TECHNICIAN', true, '+212-5-22-123458', 'Building A, Floor 1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('test_tech2', 'test.tech2@dgh.gov.ma', 'Test Technician 2', 'IT Department', 'TECHNICIAN', true, '+212-5-22-123459', 'Building A, Floor 1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('test_tech3', 'test.tech3@dgh.gov.ma', 'Test Technician 3', 'IT Department', 'TECHNICIAN', true, '+212-5-22-123460', 'Building B, Floor 1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Employee users (can only see their own tickets)
('test_emp1', 'test.emp1@dgh.gov.ma', 'Test Employee 1', 'Finance Department', 'EMPLOYEE', true, '+212-5-22-123461', 'Building B, Floor 2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('test_emp2', 'test.emp2@dgh.gov.ma', 'Test Employee 2', 'HR Department', 'EMPLOYEE', true, '+212-5-22-123462', 'Building B, Floor 2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('test_emp3', 'test.emp3@dgh.gov.ma', 'Test Employee 3', 'Operations Department', 'EMPLOYEE', true, '+212-5-22-123463', 'Building C, Floor 1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('test_emp4', 'test.emp4@dgh.gov.ma', 'Test Employee 4', 'Legal Department', 'EMPLOYEE', true, '+212-5-22-123464', 'Building C, Floor 2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('test_emp5', 'test.emp5@dgh.gov.ma', 'Test Employee 5', 'Planning Department', 'EMPLOYEE', true, '+212-5-22-123465', 'Building A, Floor 3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert test tickets created by different users
-- Tickets created by test_emp1 (Finance Employee)
INSERT INTO tickets (title, description, priority, status, category, created_by, assigned_to, created_at, updated_at)
VALUES 
('Printer not working in Finance', 'The HP printer in Finance department is showing offline status', 'HIGH', 'OPEN', 'PRINTER', 
 (SELECT id FROM users WHERE ldap_username = 'test_emp1'), 
 (SELECT id FROM users WHERE ldap_username = 'test_tech1'), 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('Need access to accounting software', 'Request for access to the new accounting software for quarterly reports', 'MEDIUM', 'OPEN', 'REQUEST', 
 (SELECT id FROM users WHERE ldap_username = 'test_emp1'), 
 (SELECT id FROM users WHERE ldap_username = 'test_tech2'), 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('Computer running very slow', 'My computer takes 5 minutes to start up and applications are very slow', 'HIGH', 'IN_PROGRESS', 'HARDWARE', 
 (SELECT id FROM users WHERE ldap_username = 'test_emp1'), 
 (SELECT id FROM users WHERE ldap_username = 'test_tech1'), 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Tickets created by test_emp2 (HR Employee)
INSERT INTO tickets (title, description, priority, status, category, created_by, assigned_to, created_at, updated_at)
VALUES 
('Cannot access HR system', 'Getting authentication error when trying to log into HR management system', 'CRITICAL', 'OPEN', 'SOFTWARE', 
 (SELECT id FROM users WHERE ldap_username = 'test_emp2'), 
 (SELECT id FROM users WHERE ldap_username = 'test_tech1'), 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('Need new employee account setup', 'New employee starting next week, need account creation and access setup', 'MEDIUM', 'OPEN', 'REQUEST', 
 (SELECT id FROM users WHERE ldap_username = 'test_emp2'), 
 (SELECT id FROM users WHERE ldap_username = 'test_tech2'), 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('Email signature update', 'Need to update my email signature with new title and contact information', 'LOW', 'RESOLVED', 'REQUEST', 
 (SELECT id FROM users WHERE ldap_username = 'test_emp2'), 
 (SELECT id FROM users WHERE ldap_username = 'test_tech3'), 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Tickets created by test_emp3 (Operations Employee)
INSERT INTO tickets (title, description, priority, status, category, created_by, assigned_to, created_at, updated_at)
VALUES 
('Network connectivity issues', 'Internet connection keeps dropping every 10-15 minutes', 'HIGH', 'OPEN', 'NETWORK', 
 (SELECT id FROM users WHERE ldap_username = 'test_emp3'), 
 (SELECT id FROM users WHERE ldap_username = 'test_tech3'), 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('Software installation request', 'Need Microsoft Project installed on my workstation', 'MEDIUM', 'OPEN', 'REQUEST', 
 (SELECT id FROM users WHERE ldap_username = 'test_emp3'), 
 (SELECT id FROM users WHERE ldap_username = 'test_tech1'), 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Tickets created by test_emp4 (Legal Employee)
INSERT INTO tickets (title, description, priority, status, category, created_by, assigned_to, created_at, updated_at)
VALUES 
('Document scanner not working', 'The scanner in Legal department is not responding to scan requests', 'MEDIUM', 'IN_PROGRESS', 'HARDWARE', 
 (SELECT id FROM users WHERE ldap_username = 'test_emp4'), 
 (SELECT id FROM users WHERE ldap_username = 'test_tech2'), 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('VPN access from home', 'Need VPN access to work from home during weekends', 'LOW', 'OPEN', 'REQUEST', 
 (SELECT id FROM users WHERE ldap_username = 'test_emp4'), 
 (SELECT id FROM users WHERE ldap_username = 'test_tech3'), 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Tickets created by test_emp5 (Planning Employee)
INSERT INTO tickets (title, description, priority, status, category, created_by, assigned_to, created_at, updated_at)
VALUES 
('Monitor display problem', 'Monitor shows flickering and distorted colors', 'HIGH', 'OPEN', 'HARDWARE', 
 (SELECT id FROM users WHERE ldap_username = 'test_emp5'), 
 (SELECT id FROM users WHERE ldap_username = 'test_tech1'), 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('Database access request', 'Need read access to the planning database for project analysis', 'MEDIUM', 'OPEN', 'REQUEST', 
 (SELECT id FROM users WHERE ldap_username = 'test_emp5'), 
 (SELECT id FROM users WHERE ldap_username = 'test_tech2'), 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Tickets created by test_tech1 (Technician)
INSERT INTO tickets (title, description, priority, status, category, created_by, assigned_to, created_at, updated_at)
VALUES 
('Server maintenance scheduled', 'Scheduled maintenance for server-01 on Friday evening', 'MEDIUM', 'OPEN', 'REQUEST', 
 (SELECT id FROM users WHERE ldap_username = 'test_tech1'), 
 (SELECT id FROM users WHERE ldap_username = 'test_tech1'), 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('Backup system check needed', 'Need to verify backup system is working properly after recent changes', 'HIGH', 'OPEN', 'REQUEST', 
 (SELECT id FROM users WHERE ldap_username = 'test_tech1'), 
 (SELECT id FROM users WHERE ldap_username = 'test_tech2'), 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Tickets created by test_admin (Admin)
INSERT INTO tickets (title, description, priority, status, category, created_by, assigned_to, created_at, updated_at)
VALUES 
('System-wide security update', 'Need to schedule system-wide security updates for all workstations', 'CRITICAL', 'OPEN', 'REQUEST', 
 (SELECT id FROM users WHERE ldap_username = 'test_admin'), 
 (SELECT id FROM users WHERE ldap_username = 'test_tech1'), 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('Network infrastructure upgrade', 'Planning network infrastructure upgrade for Building C', 'HIGH', 'OPEN', 'REQUEST', 
 (SELECT id FROM users WHERE ldap_username = 'test_admin'), 
 (SELECT id FROM users WHERE ldap_username = 'test_tech3'), 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert test comments for some tickets
INSERT INTO ticket_comments (ticket_id, user_id, comment, is_internal, created_at, comment_type)
VALUES 
-- Comments for test_emp1's printer ticket
((SELECT id FROM tickets WHERE title = 'Printer not working in Finance' LIMIT 1), 
 (SELECT id FROM users WHERE ldap_username = 'test_emp1'), 
 'The printer was working fine yesterday, but today it shows offline status', false, CURRENT_TIMESTAMP, 'COMMENT'),

((SELECT id FROM tickets WHERE title = 'Printer not working in Finance' LIMIT 1), 
 (SELECT id FROM users WHERE ldap_username = 'test_tech1'), 
 'I will check the printer connection and drivers. Will visit Finance department in 30 minutes.', true, CURRENT_TIMESTAMP, 'COMMENT'),

-- Comments for test_emp2's HR system ticket
((SELECT id FROM tickets WHERE title = 'Cannot access HR system' LIMIT 1), 
 (SELECT id FROM users WHERE ldap_username = 'test_emp2'), 
 'This started happening this morning around 8 AM. Cannot access any HR system functions.', false, CURRENT_TIMESTAMP, 'COMMENT'),

((SELECT id FROM tickets WHERE title = 'Cannot access HR system' LIMIT 1), 
 (SELECT id FROM users WHERE ldap_username = 'test_tech1'), 
 'Checking HR system server status and user permissions.', true, CURRENT_TIMESTAMP, 'COMMENT'),

-- Comments for test_emp3's network ticket
((SELECT id FROM tickets WHERE title = 'Network connectivity issues' LIMIT 1), 
 (SELECT id FROM users WHERE ldap_username = 'test_emp3'), 
 'This is affecting my work productivity significantly. Cannot complete online tasks.', false, CURRENT_TIMESTAMP, 'COMMENT'),

((SELECT id FROM tickets WHERE title = 'Network connectivity issues' LIMIT 1), 
 (SELECT id FROM users WHERE ldap_username = 'test_tech3'), 
 'Investigating network infrastructure. Checking switch logs and connectivity.', true, CURRENT_TIMESTAMP, 'COMMENT'),

-- Comments for test_admin's security update ticket
((SELECT id FROM tickets WHERE title = 'System-wide security update' LIMIT 1), 
 (SELECT id FROM users WHERE ldap_username = 'test_admin'), 
 'This is a critical security update that needs to be deployed across all systems.', false, CURRENT_TIMESTAMP, 'COMMENT'),

((SELECT id FROM tickets WHERE title = 'System-wide security update' LIMIT 1), 
 (SELECT id FROM users WHERE ldap_username = 'test_tech1'), 
 'Will schedule the update for this weekend to minimize disruption.', true, CURRENT_TIMESTAMP, 'COMMENT');

-- Test scenarios summary:
-- 
-- 1. EMPLOYEE users (test_emp1 to test_emp5):
--    - Can only see tickets they created
--    - Can create new tickets
--    - Cannot see tickets created by other employees
--    - Cannot see tickets created by technicians or admins
--
-- 2. TECHNICIAN users (test_tech1 to test_tech3):
--    - Can see all tickets (assigned and unassigned)
--    - Can be assigned to tickets
--    - Can create tickets for themselves or others
--    - Can update ticket status and add comments
--
-- 3. ADMIN users (test_admin, test_admin2):
--    - Can see all tickets in the system
--    - Can create, edit, and delete any ticket
--    - Can assign tickets to any technician
--    - Can manage users and system settings
--
-- Test cases to verify:
-- 1. Login as test_emp1 - should only see 3 tickets (their own)
-- 2. Login as test_emp2 - should only see 3 tickets (their own)
-- 3. Login as test_tech1 - should see all tickets
-- 4. Login as test_admin - should see all tickets
-- 5. Try to create new tickets with each user type
-- 6. Verify ticket assignment permissions
-- 7. Test comment visibility based on user role 
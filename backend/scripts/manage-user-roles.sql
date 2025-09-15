-- User Role Management Script
-- Use this to update user roles in the database

-- Check current user roles
SELECT id, ldap_username, full_name, role, department, is_active 
FROM users 
ORDER BY role, ldap_username;

-- Update specific user roles (uncomment and modify as needed)

-- Make ybenkirane an ADMIN
-- UPDATE users SET role = 'ADMIN' WHERE ldap_username = 'ybenkirane';

-- Make a user a TECHNICIAN
-- UPDATE users SET role = 'TECHNICIAN' WHERE ldap_username = 'username_here';

-- Make a user an EMPLOYEE
-- UPDATE users SET role = 'EMPLOYEE' WHERE ldap_username = 'username_here';

-- Add new users with specific roles
-- INSERT INTO users (ldap_username, email, full_name, department, role, is_active, created_at, updated_at) 
-- VALUES ('newuser', 'newuser@dgh.gov.ma', 'New User', 'IT Department', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Deactivate a user
-- UPDATE users SET is_active = false WHERE ldap_username = 'username_here';

-- Reactivate a user
-- UPDATE users SET is_active = true WHERE ldap_username = 'username_here';

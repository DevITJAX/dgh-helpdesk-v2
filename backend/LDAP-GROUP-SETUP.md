# LDAP Group Setup Guide

This guide explains how to configure LDAP group-based role assignment for your DGH Helpdesk system.

## Current LDAP Groups

Based on your Windows Server, you have these groups:
- **Helpdesk_Admin** (DGH Admin Group) → ADMIN role
- **Helpdesk_Tech** (DGH Tech Group) → TECHNICIAN role  
- **Helpdesk_User** (DGH User Group) → EMPLOYEE role

## How It Works

1. **User logs in** with their Windows credentials
2. **System queries LDAP** to get user's group memberships
3. **Role is determined** based on group membership
4. **User gets appropriate permissions** in the helpdesk system

## Configuration Files

### 1. LDAP Group Mapping (`ldap-group-mapping.properties`)
```properties
# Admin Groups (comma-separated list)
ldap.groups.admin=Helpdesk_Admin,DGH Admin Group,helpdesk_admin

# Technician Groups (comma-separated list)  
ldap.groups.technician=Helpdesk_Tech,DGH Tech Group,helpdesk_tech

# Employee Groups (comma-separated list)
ldap.groups.employee=Helpdesk_User,DGH User Group,helpdesk_user

# Debug LDAP Group Processing
ldap.debug.enabled=true
ldap.debug.log.groups=true
ldap.debug.log.role.assignment=true
```

### 2. LDAP Server Configuration (`application-prod.properties`)
```properties
# LDAP Configuration for Azure Windows Server (DGH-DATA)
ldap.server.url=ldap://135.232.121.145:389
ldap.server.domain=dgh.local
ldap.server.bind.user=CN=adminuser,CN=Users,DC=dgh,DC=local
ldap.server.bind.password=Admin@2025!Complex123XYZ
ldap.server.search.base=CN=Users,DC=dgh,DC=local
```

## Testing LDAP Group Assignment

### 1. Check Current Configuration
```bash
curl http://localhost:8080/api/ldap-test/config
```

### 2. Test User Group Membership
```bash
curl http://localhost:8080/api/ldap-test/test-groups/ybenkirane
```

### 3. Check Backend Logs
Look for these log messages during login:
```
=== LDAP GROUP MAPPING DEBUG ===
Username: ybenkirane
LDAP Groups: [CN=Helpdesk_Admin,CN=Users,DC=dgh,DC=local]
User ybenkirane assigned ADMIN role based on LDAP group membership
```

## Troubleshooting

### Problem: User still gets EMPLOYEE role
**Solution**: Check the backend logs for:
1. Are LDAP groups being retrieved? Look for "User LDAP groups: [...]"
2. Are groups matching the patterns? Look for "✓ MATCH FOUND" messages
3. Is LDAP connection working? Look for LDAP authentication errors

### Problem: LDAP groups not being retrieved
**Possible causes**:
1. User not member of any groups
2. LDAP query not finding user
3. `memberOf` attribute not available
4. LDAP connection issues

### Problem: Groups retrieved but no role match
**Solution**: Update `ldap-group-mapping.properties` to include your exact group names

## Adding New Groups

To add new LDAP groups:

1. **Create group in Windows Server**
2. **Add users to the group**
3. **Update `ldap-group-mapping.properties`**:
   ```properties
   ldap.groups.admin=Helpdesk_Admin,DGH Admin Group,NewAdminGroup
   ```

## Role Hierarchy

- **ADMIN**: Full system access, can manage users and system settings
- **TECHNICIAN**: Can see all tickets, assign tickets, resolve tickets
- **EMPLOYEE**: Can only see their own tickets, create new tickets

## Security Notes

- LDAP credentials are stored securely in configuration
- Group membership is checked on every login
- User roles are automatically updated if group membership changes
- Fallback to username-based mapping if LDAP groups not found

## Monitoring

Check these log patterns for successful LDAP group assignment:
```
User [username] assigned [ROLE] role based on LDAP group membership
```

Check these log patterns for issues:
```
No matching LDAP groups found for user: [username]
No LDAP groups found, using username mapping: [ROLE]
```

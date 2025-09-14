# LDAP Migration Guide for DGH Helpdesk System

This guide will help you set up a new LDAP server on Azure VM with the same configuration as your existing DGH helpdesk system.

## Prerequisites

- Azure VM running Windows Server 2019/2022
- Administrator access to the VM
- PowerShell execution policy set to allow scripts
- Network connectivity between your application and the new LDAP server

## Current Configuration

Based on your existing setup:
- **Domain**: `dgh.local`
- **LDAP Server**: `68.221.171.67:389`
- **Bind User**: `CN=adminuser,CN=Users,DC=dgh,DC=local`
- **Search Base**: `CN=Users,DC=dgh,DC=local`

## Migration Steps

### Step 1: Prepare the New Azure VM

1. **Create Azure VM**:
   ```powershell
   # Example Azure CLI commands (run from your local machine)
   az vm create --resource-group dgh-helpdesk-rg --name dgh-ldap-vm --image Win2019Datacenter --size Standard_D2s_v3 --admin-username azureuser --admin-password "YourSecurePassword123!"
   ```

2. **Open Required Ports**:
   ```powershell
   # Open LDAP ports
   az vm open-port --resource-group dgh-helpdesk-rg --name dgh-ldap-vm --port 389 --priority 1000
   az vm open-port --resource-group dgh-helpdesk-rg --name dgh-ldap-vm --port 636 --priority 1001
   ```

### Step 2: Run the Setup Scripts

1. **Connect to your new Azure VM** via RDP or Azure Bastion

2. **Download and run the first script**:
   ```powershell
   # Run as Administrator
   .\setup-ldap-azure-vm.ps1 -NewVMIP "YOUR_NEW_VM_IP"
   ```

3. **After the server restarts, run the second script**:
   ```powershell
   # Run as Administrator
   .\setup-ldap-users-and-config.ps1
   ```

4. **Test the LDAP setup**:
   ```powershell
   # Run as Administrator
   .\test-ldap-connection.ps1
   ```

### Step 3: Update Your Application Configuration

Update your `application-prod.properties` file:

```properties
# Update LDAP Configuration for new server
ldap.server.url=ldap://YOUR_NEW_VM_IP:389
ldap.server.domain=dgh.local
ldap.server.bind.user=CN=adminuser,CN=Users,DC=dgh,DC=local
ldap.server.bind.password=Dgh@2025Bind!
ldap.server.search.base=CN=Users,DC=dgh,DC=local
```

### Step 4: Migrate Users from Existing LDAP (Optional)

If you want to migrate users from your existing LDAP server, use the migration script:

```powershell
# Run as Administrator on the new server
.\migrate-users-from-existing-ldap.ps1 -SourceLdapServer "68.221.171.67" -SourceDomain "dgh.local"
```

## Scripts Overview

### 1. `setup-ldap-azure-vm.ps1`
- Installs Active Directory Domain Services
- Configures the server as a domain controller
- Sets up the `dgh.local` domain
- **Note**: Server will restart after this script

### 2. `setup-ldap-users-and-config.ps1`
- Creates organizational units and security groups
- Creates the LDAP bind user (`adminuser`)
- Creates test users matching your test-data.sql
- Configures LDAP services and firewall rules
- Tests the setup

### 3. `test-ldap-connection.ps1`
- Tests LDAP port connectivity
- Validates user authentication
- Tests LDAP search functionality
- Provides configuration details for your application

### 4. `migrate-users-from-existing-ldap.ps1` (Optional)
- Connects to your existing LDAP server
- Exports users and groups
- Imports them to the new server

## Security Considerations

1. **Change Default Passwords**: Update all default passwords in production
2. **Enable LDAPS**: Consider setting up LDAP over SSL for production
3. **Firewall Rules**: Ensure only necessary ports are open
4. **Backup**: Regular backups of Active Directory
5. **Monitoring**: Set up monitoring for LDAP services

## Troubleshooting

### Common Issues

1. **Port 389 not accessible**:
   - Check Windows Firewall rules
   - Verify Azure NSG rules
   - Ensure AD DS is running

2. **Authentication failures**:
   - Verify user passwords
   - Check user account status (enabled/disabled)
   - Verify domain configuration

3. **Search failures**:
   - Check bind user permissions
   - Verify search base DN
   - Test with LDAP browser tools

### Useful Commands

```powershell
# Check AD DS service status
Get-Service -Name "ADWS", "KDC", "Netlogon"

# List all users
Get-ADUser -Filter *

# Test LDAP connection
Test-NetConnection -ComputerName localhost -Port 389

# Check domain controller status
Get-ADDomainController -Filter *
```

## Testing Your Application

After setting up the new LDAP server:

1. Update your application configuration
2. Restart your application
3. Test login with test users:
   - `test_admin` / `Dgh@2025Test!`
   - `test_tech1` / `Dgh@2025Test!`
   - `test_emp1` / `Dgh@2025Test!`

## Rollback Plan

If you need to rollback to the original LDAP server:

1. Update `application-prod.properties` with original settings
2. Restart your application
3. Keep the new LDAP server for future use or decommission it

## Support

For issues with this migration:
1. Check the PowerShell execution logs
2. Verify network connectivity
3. Test individual components using the test script
4. Review Windows Event Logs for AD DS errors

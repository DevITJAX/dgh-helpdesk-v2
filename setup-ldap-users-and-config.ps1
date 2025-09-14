# PowerShell Script to Configure Users and LDAP Services
# Run this script AFTER the domain controller setup is complete and server has restarted
# Run as Administrator on the new Azure VM

param(
    [Parameter(Mandatory=$false)]
    [string]$DomainName = "dgh.local",
    
    [Parameter(Mandatory=$false)]
    [string]$BindUserPassword = "Dgh@2025Bind!",
    
    [Parameter(Mandatory=$false)]
    [string]$AdminPassword = "Dgh@2025Admin!"
)

Write-Host "Configuring LDAP Users and Services for DGH Helpdesk System..." -ForegroundColor Green

# Function to check if running as Administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Check if running as Administrator
if (-not (Test-Administrator)) {
    Write-Error "This script must be run as Administrator. Please restart PowerShell as Administrator and run this script again."
    exit 1
}

# Import required modules
Import-Module ActiveDirectory
Import-Module DnsServer

# Step 1: Create Organizational Units and Groups
Write-Host "`nStep 1: Creating Organizational Units and Groups..." -ForegroundColor Cyan

try {
    # Create OUs
    New-ADOrganizationalUnit -Name "DGH_Users" -Path "DC=dgh,DC=local" -ProtectedFromAccidentalDeletion $false
    New-ADOrganizationalUnit -Name "DGH_Groups" -Path "DC=dgh,DC=local" -ProtectedFromAccidentalDeletion $false
    New-ADOrganizationalUnit -Name "DGH_Technicians" -Path "OU=DGH_Users,DC=dgh,DC=local" -ProtectedFromAccidentalDeletion $false
    New-ADOrganizationalUnit -Name "DGH_Employees" -Path "OU=DGH_Users,DC=dgh,DC=local" -ProtectedFromAccidentalDeletion $false
    New-ADOrganizationalUnit -Name "DGH_Admins" -Path "OU=DGH_Users,DC=dgh,DC=local" -ProtectedFromAccidentalDeletion $false
    
    Write-Host "Organizational Units created successfully." -ForegroundColor Green
} catch {
    Write-Warning "Some OUs may already exist: $($_.Exception.Message)"
}

# Step 2: Create Security Groups
Write-Host "`nStep 2: Creating Security Groups..." -ForegroundColor Cyan

try {
    # Create groups for different roles
    New-ADGroup -Name "DGH_Helpdesk_Admins" -GroupCategory Security -GroupScope Global -Path "OU=DGH_Groups,DC=dgh,DC=local" -Description "DGH Helpdesk Administrators"
    New-ADGroup -Name "DGH_Helpdesk_Technicians" -GroupCategory Security -GroupScope Global -Path "OU=DGH_Groups,DC=dgh,DC=local" -Description "DGH Helpdesk Technicians"
    New-ADGroup -Name "DGH_Helpdesk_Employees" -GroupCategory Security -GroupScope Global -Path "OU=DGH_Groups,DC=dgh,DC=local" -Description "DGH Helpdesk Employees"
    
    Write-Host "Security Groups created successfully." -ForegroundColor Green
} catch {
    Write-Warning "Some groups may already exist: $($_.Exception.Message)"
}

# Step 3: Create Bind User for LDAP Authentication
Write-Host "`nStep 3: Creating LDAP Bind User..." -ForegroundColor Cyan

try {
    $BindUserPasswordSecure = ConvertTo-SecureString -String $BindUserPassword -AsPlainText -Force
    
    New-ADUser -Name "adminuser" -UserPrincipalName "adminuser@$DomainName" -SamAccountName "adminuser" -DisplayName "LDAP Bind User" -Description "LDAP Bind User for DGH Helpdesk" -Path "OU=DGH_Admins,DC=dgh,DC=local" -AccountPassword $BindUserPasswordSecure -Enabled $true -PasswordNeverExpires $true
    
    # Add to Domain Admins group
    Add-ADGroupMember -Identity "Domain Admins" -Members "adminuser"
    Add-ADGroupMember -Identity "DGH_Helpdesk_Admins" -Members "adminuser"
    
    Write-Host "LDAP Bind User 'adminuser' created successfully." -ForegroundColor Green
} catch {
    Write-Warning "Bind user may already exist: $($_.Exception.Message)"
}

# Step 4: Create Test Users (matching your test-data.sql)
Write-Host "`nStep 4: Creating Test Users..." -ForegroundColor Cyan

# Test Admin Users
$testUsers = @(
    @{Name="test_admin"; DisplayName="Test Administrator"; Email="test.admin@dgh.gov.ma"; Department="IT Department"; Role="ADMIN"; OU="DGH_Admins"},
    @{Name="test_admin2"; DisplayName="Test Admin Assistant"; Email="test.admin2@dgh.gov.ma"; Department="IT Department"; Role="ADMIN"; OU="DGH_Admins"},
    @{Name="test_tech1"; DisplayName="Test Technician 1"; Email="test.tech1@dgh.gov.ma"; Department="IT Department"; Role="TECHNICIAN"; OU="DGH_Technicians"},
    @{Name="test_tech2"; DisplayName="Test Technician 2"; Email="test.tech2@dgh.gov.ma"; Department="IT Department"; Role="TECHNICIAN"; OU="DGH_Technicians"},
    @{Name="test_tech3"; DisplayName="Test Technician 3"; Email="test.tech3@dgh.gov.ma"; Department="IT Department"; Role="TECHNICIAN"; OU="DGH_Technicians"},
    @{Name="test_emp1"; DisplayName="Test Employee 1"; Email="test.emp1@dgh.gov.ma"; Department="Finance Department"; Role="EMPLOYEE"; OU="DGH_Employees"},
    @{Name="test_emp2"; DisplayName="Test Employee 2"; Email="test.emp2@dgh.gov.ma"; Department="HR Department"; Role="EMPLOYEE"; OU="DGH_Employees"},
    @{Name="test_emp3"; DisplayName="Test Employee 3"; Email="test.emp3@dgh.gov.ma"; Department="Operations Department"; Role="EMPLOYEE"; OU="DGH_Employees"},
    @{Name="test_emp4"; DisplayName="Test Employee 4"; Email="test.emp4@dgh.gov.ma"; Department="Legal Department"; Role="EMPLOYEE"; OU="DGH_Employees"},
    @{Name="test_emp5"; DisplayName="Test Employee 5"; Email="test.emp5@dgh.gov.ma"; Department="Planning Department"; Role="EMPLOYEE"; OU="DGH_Employees"}
)

$defaultPassword = ConvertTo-SecureString -String "Dgh@2025Test!" -AsPlainText -Force

foreach ($user in $testUsers) {
    try {
        $userPath = "OU=$($user.OU),DC=dgh,DC=local"
        
        New-ADUser -Name $user.Name -UserPrincipalName "$($user.Name)@$DomainName" -SamAccountName $user.Name -DisplayName $user.DisplayName -EmailAddress $user.Email -Description "Test User - $($user.Role)" -Path $userPath -AccountPassword $defaultPassword -Enabled $true -PasswordNeverExpires $true
        
        # Add to appropriate group
        switch ($user.Role) {
            "ADMIN" { Add-ADGroupMember -Identity "DGH_Helpdesk_Admins" -Members $user.Name }
            "TECHNICIAN" { Add-ADGroupMember -Identity "DGH_Helpdesk_Technicians" -Members $user.Name }
            "EMPLOYEE" { Add-ADGroupMember -Identity "DGH_Helpdesk_Employees" -Members $user.Name }
        }
        
        Write-Host "Created user: $($user.Name) ($($user.Role))" -ForegroundColor Green
    } catch {
        Write-Warning "User $($user.Name) may already exist: $($_.Exception.Message)"
    }
}

# Step 5: Configure LDAP Services
Write-Host "`nStep 5: Configuring LDAP Services..." -ForegroundColor Cyan

try {
    # Enable LDAP over SSL (optional but recommended)
    # This would require a certificate - for now we'll use standard LDAP
    
    # Configure LDAP settings
    $ldapConfig = @{
        "LDAPServerIntegrity" = 1
        "LDAPServerSigning" = 1
        "LDAPServerRequireIntegrity" = 0
        "LDAPServerRequireSigning" = 0
    }
    
    foreach ($setting in $ldapConfig.GetEnumerator()) {
        Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\NTDS\Parameters" -Name $setting.Key -Value $setting.Value -Force
    }
    
    Write-Host "LDAP Services configured successfully." -ForegroundColor Green
} catch {
    Write-Warning "LDAP configuration may have issues: $($_.Exception.Message)"
}

# Step 6: Configure Firewall Rules
Write-Host "`nStep 6: Configuring Firewall Rules..." -ForegroundColor Cyan

try {
    # Allow LDAP traffic (port 389)
    New-NetFirewallRule -DisplayName "LDAP" -Direction Inbound -Protocol TCP -LocalPort 389 -Action Allow
    New-NetFirewallRule -DisplayName "LDAP UDP" -Direction Inbound -Protocol UDP -LocalPort 389 -Action Allow
    
    # Allow LDAPS traffic (port 636) - for future SSL implementation
    New-NetFirewallRule -DisplayName "LDAPS" -Direction Inbound -Protocol TCP -LocalPort 636 -Action Allow
    
    # Allow RPC traffic for domain operations
    New-NetFirewallRule -DisplayName "RPC Endpoint Mapper" -Direction Inbound -Protocol TCP -LocalPort 135 -Action Allow
    New-NetFirewallRule -DisplayName "RPC Dynamic Ports" -Direction Inbound -Protocol TCP -LocalPort 49152-65535 -Action Allow
    
    Write-Host "Firewall rules configured successfully." -ForegroundColor Green
} catch {
    Write-Warning "Firewall configuration may have issues: $($_.Exception.Message)"
}

# Step 7: Test LDAP Connectivity
Write-Host "`nStep 7: Testing LDAP Connectivity..." -ForegroundColor Cyan

try {
    # Test LDAP connection
    $ldapTest = Test-NetConnection -ComputerName "localhost" -Port 389
    if ($ldapTest.TcpTestSucceeded) {
        Write-Host "LDAP port 389 is accessible." -ForegroundColor Green
    } else {
        Write-Warning "LDAP port 389 is not accessible."
    }
    
    # Test user authentication
    $testUser = "test_admin"
    $testPassword = "Dgh@2025Test!"
    
    try {
        $credential = New-Object System.Management.Automation.PSCredential("$testUser@$DomainName", (ConvertTo-SecureString -String $testPassword -AsPlainText -Force))
        $result = Get-ADUser -Identity $testUser -Credential $credential
        Write-Host "User authentication test successful for: $testUser" -ForegroundColor Green
    } catch {
        Write-Warning "User authentication test failed: $($_.Exception.Message)"
    }
    
} catch {
    Write-Warning "LDAP connectivity test failed: $($_.Exception.Message)"
}

# Step 8: Display Configuration Summary
Write-Host "`nStep 8: Configuration Summary..." -ForegroundColor Cyan

Write-Host "`n=== DGH LDAP Configuration Summary ===" -ForegroundColor Yellow
Write-Host "Domain: $DomainName" -ForegroundColor White
Write-Host "LDAP Server: $env:COMPUTERNAME.$DomainName" -ForegroundColor White
Write-Host "LDAP Port: 389" -ForegroundColor White
Write-Host "Bind User: CN=adminuser,CN=Users,DC=dgh,DC=local" -ForegroundColor White
Write-Host "Search Base: CN=Users,DC=dgh,DC=local" -ForegroundColor White
Write-Host "`nTest Users Created:" -ForegroundColor White
Write-Host "- test_admin (ADMIN)" -ForegroundColor White
Write-Host "- test_tech1, test_tech2, test_tech3 (TECHNICIAN)" -ForegroundColor White
Write-Host "- test_emp1, test_emp2, test_emp3, test_emp4, test_emp5 (EMPLOYEE)" -ForegroundColor White
Write-Host "`nDefault Password for Test Users: Dgh@2025Test!" -ForegroundColor White
Write-Host "Bind User Password: $BindUserPassword" -ForegroundColor White

Write-Host "`n=== Next Steps ===" -ForegroundColor Yellow
Write-Host "1. Update your application's LDAP configuration to point to this new server" -ForegroundColor White
Write-Host "2. Test the connection from your helpdesk application" -ForegroundColor White
Write-Host "3. Consider setting up LDAPS (LDAP over SSL) for production use" -ForegroundColor White

Write-Host "`nLDAP Setup Complete!" -ForegroundColor Green

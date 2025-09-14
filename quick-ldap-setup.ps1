# Quick LDAP Setup Script for DGH Helpdesk
# This script provides an interactive setup process for your new LDAP server
# Run as Administrator on your new Azure VM

param(
    [Parameter(Mandatory=$false)]
    [string]$NewVMIP = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipDomainSetup = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$MigrateUsers = $false,
    
    [Parameter(Mandatory=$false)]
    [string]$SourceLdapServer = "68.221.171.67"
)

Write-Host "=== DGH Helpdesk LDAP Setup ===" -ForegroundColor Green
Write-Host "This script will set up LDAP on your Azure VM with the same configuration as your existing system." -ForegroundColor White

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

# Get VM IP if not provided
if ([string]::IsNullOrEmpty($NewVMIP)) {
    $NewVMIP = Read-Host "Enter your new Azure VM IP address"
}

Write-Host "`nConfiguration:" -ForegroundColor Yellow
Write-Host "New VM IP: $NewVMIP" -ForegroundColor White
Write-Host "Domain: dgh.local" -ForegroundColor White
Write-Host "Bind User: adminuser" -ForegroundColor White
Write-Host "Search Base: CN=Users,DC=dgh,DC=local" -ForegroundColor White

$confirm = Read-Host "`nDo you want to proceed with the setup? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Setup cancelled." -ForegroundColor Yellow
    exit 0
}

# Step 1: Domain Controller Setup (if not skipped)
if (-not $SkipDomainSetup) {
    Write-Host "`n=== Step 1: Setting up Domain Controller ===" -ForegroundColor Cyan
    
    $domainConfirm = Read-Host "This will install Active Directory and restart the server. Continue? (y/N)"
    if ($domainConfirm -eq "y" -or $domainConfirm -eq "Y") {
        try {
            Write-Host "Running domain controller setup..." -ForegroundColor Yellow
            & .\setup-ldap-azure-vm.ps1 -NewVMIP $NewVMIP
            
            Write-Host "`nIMPORTANT: The server will restart after domain controller setup." -ForegroundColor Red
            Write-Host "After restart, run this script again with -SkipDomainSetup parameter:" -ForegroundColor Yellow
            Write-Host ".\quick-ldap-setup.ps1 -SkipDomainSetup -NewVMIP $NewVMIP" -ForegroundColor White
            
            $restartConfirm = Read-Host "`nPress Enter to restart the server now..."
            Restart-Computer -Force
        } catch {
            Write-Error "Domain controller setup failed: $($_.Exception.Message)"
            exit 1
        }
    } else {
        Write-Host "Domain controller setup skipped." -ForegroundColor Yellow
    }
} else {
    Write-Host "`n=== Step 1: Domain Controller Setup (Skipped) ===" -ForegroundColor Cyan
    Write-Host "Domain controller setup was skipped. Proceeding with user configuration..." -ForegroundColor Yellow
}

# Step 2: User and Service Configuration
Write-Host "`n=== Step 2: Configuring Users and Services ===" -ForegroundColor Cyan

try {
    Write-Host "Running user and service configuration..." -ForegroundColor Yellow
    & .\setup-ldap-users-and-config.ps1
    
    Write-Host "User and service configuration completed successfully." -ForegroundColor Green
} catch {
    Write-Error "User and service configuration failed: $($_.Exception.Message)"
    exit 1
}

# Step 3: User Migration (if requested)
if ($MigrateUsers) {
    Write-Host "`n=== Step 3: Migrating Users from Existing LDAP ===" -ForegroundColor Cyan
    
    $migrateConfirm = Read-Host "Do you want to migrate users from your existing LDAP server ($SourceLdapServer)? (y/N)"
    if ($migrateConfirm -eq "y" -or $migrateConfirm -eq "Y") {
        try {
            Write-Host "Starting user migration..." -ForegroundColor Yellow
            & .\migrate-users-from-existing-ldap.ps1 -SourceLdapServer $SourceLdapServer
            
            Write-Host "User migration completed successfully." -ForegroundColor Green
        } catch {
            Write-Error "User migration failed: $($_.Exception.Message)"
        }
    } else {
        Write-Host "User migration skipped." -ForegroundColor Yellow
    }
} else {
    Write-Host "`n=== Step 3: User Migration (Skipped) ===" -ForegroundColor Cyan
    Write-Host "User migration was skipped. You can run it later with:" -ForegroundColor Yellow
    Write-Host ".\migrate-users-from-existing-ldap.ps1 -SourceLdapServer $SourceLdapServer" -ForegroundColor White
}

# Step 4: Test LDAP Connection
Write-Host "`n=== Step 4: Testing LDAP Connection ===" -ForegroundColor Cyan

$testConfirm = Read-Host "Do you want to test the LDAP connection now? (Y/n)"
if ($testConfirm -ne "n" -and $testConfirm -ne "N") {
    try {
        Write-Host "Running LDAP connection tests..." -ForegroundColor Yellow
        & .\test-ldap-connection.ps1 -LdapServer $NewVMIP
        
        Write-Host "LDAP connection tests completed." -ForegroundColor Green
    } catch {
        Write-Error "LDAP connection tests failed: $($_.Exception.Message)"
    }
} else {
    Write-Host "LDAP connection tests skipped." -ForegroundColor Yellow
}

# Step 5: Display Final Configuration
Write-Host "`n=== Final Configuration ===" -ForegroundColor Yellow
Write-Host "Your LDAP server is now configured with the following settings:" -ForegroundColor White
Write-Host ""
Write-Host "LDAP Server: $NewVMIP" -ForegroundColor Cyan
Write-Host "Domain: dgh.local" -ForegroundColor Cyan
Write-Host "Bind User: CN=adminuser,CN=Users,DC=dgh,DC=local" -ForegroundColor Cyan
Write-Host "Bind Password: Dgh@2025Bind!" -ForegroundColor Cyan
Write-Host "Search Base: CN=Users,DC=dgh,DC=local" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test Users:" -ForegroundColor White
Write-Host "- test_admin (ADMIN) - Password: Dgh@2025Test!" -ForegroundColor White
Write-Host "- test_tech1 (TECHNICIAN) - Password: Dgh@2025Test!" -ForegroundColor White
Write-Host "- test_emp1 (EMPLOYEE) - Password: Dgh@2025Test!" -ForegroundColor White

Write-Host "`n=== Next Steps ===" -ForegroundColor Yellow
Write-Host "1. Update your application's application-prod.properties file:" -ForegroundColor White
Write-Host "   ldap.server.url=ldap://$NewVMIP:389" -ForegroundColor Cyan
Write-Host "   ldap.server.domain=dgh.local" -ForegroundColor Cyan
Write-Host "   ldap.server.bind.user=CN=adminuser,CN=Users,DC=dgh,DC=local" -ForegroundColor Cyan
Write-Host "   ldap.server.bind.password=Dgh@2025Bind!" -ForegroundColor Cyan
Write-Host "   ldap.server.search.base=CN=Users,DC=dgh,DC=local" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Restart your DGH Helpdesk application" -ForegroundColor White
Write-Host "3. Test login with the test users" -ForegroundColor White
Write-Host "4. Consider setting up LDAPS for production use" -ForegroundColor White

Write-Host "`n🎉 LDAP Setup Complete!" -ForegroundColor Green
Write-Host "Your new LDAP server is ready for use with your DGH Helpdesk system." -ForegroundColor White

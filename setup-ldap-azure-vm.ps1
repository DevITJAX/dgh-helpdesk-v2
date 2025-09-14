# PowerShell Script to Setup LDAP on Azure VM
# This script sets up Active Directory Domain Services with the same configuration as your existing DGH helpdesk system
# Run this script as Administrator on your new Azure VM

param(
    [Parameter(Mandatory=$true)]
    [string]$NewVMIP,
    
    [Parameter(Mandatory=$false)]
    [string]$DomainName = "dgh.local",
    
    [Parameter(Mandatory=$false)]
    [string]$SafeModePassword = "Dgh@2025SafeMode!",
    
    [Parameter(Mandatory=$false)]
    [string]$AdminPassword = "Dgh@2025Admin!",
    
    [Parameter(Mandatory=$false)]
    [string]$BindUserPassword = "Dgh@2025Bind!"
)

Write-Host "Starting LDAP Setup for DGH Helpdesk System..." -ForegroundColor Green
Write-Host "Target VM IP: $NewVMIP" -ForegroundColor Yellow
Write-Host "Domain: $DomainName" -ForegroundColor Yellow

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

# Step 1: Install Windows Features for Active Directory
Write-Host "`nStep 1: Installing Windows Features for Active Directory..." -ForegroundColor Cyan

try {
    # Install required Windows features
    Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools
    Install-WindowsFeature -Name DNS -IncludeManagementTools
    Install-WindowsFeature -Name RSAT-AD-PowerShell
    Install-WindowsFeature -Name RSAT-DNS-Server
    
    Write-Host "Windows Features installed successfully." -ForegroundColor Green
} catch {
    Write-Error "Failed to install Windows Features: $($_.Exception.Message)"
    exit 1
}

# Step 2: Configure Server as Domain Controller
Write-Host "`nStep 2: Configuring Server as Domain Controller..." -ForegroundColor Cyan

try {
    # Import ADDSDeployment module
    Import-Module ADDSDeployment
    
    # Convert password to secure string
    $SecureSafeModePassword = ConvertTo-SecureString -String $SafeModePassword -AsPlainText -Force
    
    # Install AD DS and promote to domain controller
    Install-ADDSForest `
        -DomainName $DomainName `
        -SafeModeAdministratorPassword $SecureSafeModePassword `
        -InstallDns:$true `
        -CreateDnsDelegation:$false `
        -DatabasePath "C:\Windows\NTDS" `
        -LogPath "C:\Windows\NTDS" `
        -SysvolPath "C:\Windows\SYSVOL" `
        -Force:$true
    
    Write-Host "Domain Controller installation completed successfully." -ForegroundColor Green
    Write-Host "Server will restart automatically in 10 seconds..." -ForegroundColor Yellow
    
    # Restart the server
    Restart-Computer -Force
} catch {
    Write-Error "Failed to configure Domain Controller: $($_.Exception.Message)"
    exit 1
}

# Note: The script will restart here, so the remaining steps need to be run after restart
Write-Host "`nIMPORTANT: After the server restarts, run the second part of this script:" -ForegroundColor Red
Write-Host "setup-ldap-users-and-config.ps1" -ForegroundColor Yellow

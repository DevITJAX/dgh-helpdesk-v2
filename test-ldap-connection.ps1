# PowerShell Script to Test LDAP Connection and Authentication
# This script tests the LDAP setup and validates user authentication
# Run this script to verify your LDAP configuration

param(
    [Parameter(Mandatory=$false)]
    [string]$LdapServer = "localhost",
    
    [Parameter(Mandatory=$false)]
    [string]$DomainName = "dgh.local",
    
    [Parameter(Mandatory=$false)]
    [string]$BindUser = "adminuser",
    
    [Parameter(Mandatory=$false)]
    [string]$BindPassword = "Dgh@2025Bind!",
    
    [Parameter(Mandatory=$false)]
    [string]$TestUser = "test_admin",
    
    [Parameter(Mandatory=$false)]
    [string]$TestPassword = "Dgh@2025Test!"
)

Write-Host "Testing LDAP Connection and Authentication..." -ForegroundColor Green
Write-Host "LDAP Server: $LdapServer" -ForegroundColor Yellow
Write-Host "Domain: $DomainName" -ForegroundColor Yellow

# Function to test LDAP port connectivity
function Test-LdapPort {
    param([string]$Server, [int]$Port)
    
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect($Server, $Port)
        $tcpClient.Close()
        return $true
    } catch {
        return $false
    }
}

# Function to test LDAP authentication using .NET DirectoryServices
function Test-LdapAuthentication {
    param(
        [string]$Server,
        [string]$Domain,
        [string]$Username,
        [string]$Password
    )
    
    try {
        Add-Type -AssemblyName System.DirectoryServices.AccountManagement
        $contextType = [System.DirectoryServices.AccountManagement.ContextType]::Domain
        $context = New-Object System.DirectoryServices.AccountManagement.PrincipalContext($contextType, $Server, $Domain)
        
        $isValid = $context.ValidateCredentials($Username, $Password)
        $context.Dispose()
        return $isValid
    } catch {
        Write-Warning "LDAP Authentication test failed: $($_.Exception.Message)"
        return $false
    }
}

# Function to test LDAP search using DirectoryEntry
function Test-LdapSearch {
    param(
        [string]$Server,
        [string]$Domain,
        [string]$BindUser,
        [string]$BindPassword,
        [string]$SearchBase
    )
    
    try {
        $ldapPath = "LDAP://$Server/$SearchBase"
        $username = "$BindUser@$Domain"
        
        $directoryEntry = New-Object System.DirectoryServices.DirectoryEntry($ldapPath, $username, $BindPassword)
        $directorySearcher = New-Object System.DirectoryServices.DirectorySearcher($directoryEntry)
        $directorySearcher.Filter = "(objectClass=user)"
        $directorySearcher.SizeLimit = 10
        
        $results = $directorySearcher.FindAll()
        $directorySearcher.Dispose()
        $directoryEntry.Dispose()
        
        return $results.Count
    } catch {
        Write-Warning "LDAP Search test failed: $($_.Exception.Message)"
        return 0
    }
}

# Test 1: Port Connectivity
Write-Host "`nTest 1: Testing LDAP Port Connectivity..." -ForegroundColor Cyan
$port389 = Test-LdapPort -Server $LdapServer -Port 389
$port636 = Test-LdapPort -Server $LdapServer -Port 636

if ($port389) {
    Write-Host "✓ LDAP port 389 is accessible" -ForegroundColor Green
} else {
    Write-Host "✗ LDAP port 389 is not accessible" -ForegroundColor Red
}

if ($port636) {
    Write-Host "✓ LDAPS port 636 is accessible" -ForegroundColor Green
} else {
    Write-Host "✗ LDAPS port 636 is not accessible (optional)" -ForegroundColor Yellow
}

# Test 2: Bind User Authentication
Write-Host "`nTest 2: Testing Bind User Authentication..." -ForegroundColor Cyan
$bindAuth = Test-LdapAuthentication -Server $LdapServer -Domain $DomainName -Username $BindUser -Password $BindPassword

if ($bindAuth) {
    Write-Host "✓ Bind user '$BindUser' authentication successful" -ForegroundColor Green
} else {
    Write-Host "✗ Bind user '$BindUser' authentication failed" -ForegroundColor Red
}

# Test 3: Test User Authentication
Write-Host "`nTest 3: Testing Test User Authentication..." -ForegroundColor Cyan
$testAuth = Test-LdapAuthentication -Server $LdapServer -Domain $DomainName -Username $TestUser -Password $TestPassword

if ($testAuth) {
    Write-Host "✓ Test user '$TestUser' authentication successful" -ForegroundColor Green
} else {
    Write-Host "✗ Test user '$TestUser' authentication failed" -ForegroundColor Red
}

# Test 4: LDAP Search
Write-Host "`nTest 4: Testing LDAP Search..." -ForegroundColor Cyan
$searchBase = "CN=Users,DC=dgh,DC=local"
$searchResults = Test-LdapSearch -Server $LdapServer -Domain $DomainName -BindUser $BindUser -BindPassword $BindPassword -SearchBase $searchBase

if ($searchResults -gt 0) {
    Write-Host "✓ LDAP search successful - found $searchResults users" -ForegroundColor Green
} else {
    Write-Host "✗ LDAP search failed or no users found" -ForegroundColor Red
}

# Test 5: Active Directory PowerShell Module Test
Write-Host "`nTest 5: Testing Active Directory PowerShell Module..." -ForegroundColor Cyan

try {
    Import-Module ActiveDirectory -ErrorAction Stop
    
    # Test getting domain info
    $domainInfo = Get-ADDomain
    Write-Host "✓ Active Directory module working" -ForegroundColor Green
    Write-Host "  Domain: $($domainInfo.DNSRoot)" -ForegroundColor White
    Write-Host "  Forest: $($domainInfo.Forest)" -ForegroundColor White
    
    # Test getting users
    $users = Get-ADUser -Filter "Name -like 'test_*'" | Select-Object Name, SamAccountName, Enabled
    Write-Host "✓ Found $($users.Count) test users:" -ForegroundColor Green
    foreach ($user in $users) {
        Write-Host "  - $($user.Name) ($($user.SamAccountName)) - Enabled: $($user.Enabled)" -ForegroundColor White
    }
    
} catch {
    Write-Host "✗ Active Directory PowerShell module test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Test all test users
Write-Host "`nTest 6: Testing All Test Users..." -ForegroundColor Cyan

$testUsers = @("test_admin", "test_admin2", "test_tech1", "test_tech2", "test_tech3", "test_emp1", "test_emp2", "test_emp3", "test_emp4", "test_emp5")
$successCount = 0

foreach ($user in $testUsers) {
    $userAuth = Test-LdapAuthentication -Server $LdapServer -Domain $DomainName -Username $user -Password $TestPassword
    if ($userAuth) {
        Write-Host "✓ $user" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "✗ $user" -ForegroundColor Red
    }
}

Write-Host "`nTest Results Summary:" -ForegroundColor Yellow
Write-Host "Port 389: $(if($port389){'✓'}else{'✗'})" -ForegroundColor White
Write-Host "Port 636: $(if($port636){'✓'}else{'✗'})" -ForegroundColor White
Write-Host "Bind User Auth: $(if($bindAuth){'✓'}else{'✗'})" -ForegroundColor White
Write-Host "Test User Auth: $(if($testAuth){'✓'}else{'✗'})" -ForegroundColor White
Write-Host "LDAP Search: $(if($searchResults -gt 0){'✓'}else{'✗'})" -ForegroundColor White
Write-Host "Test Users: $successCount/$($testUsers.Count)" -ForegroundColor White

# Generate connection string for your application
Write-Host "`n=== Application Configuration ===" -ForegroundColor Yellow
Write-Host "Update your application.properties with these settings:" -ForegroundColor White
Write-Host "ldap.server.url=ldap://$LdapServer:389" -ForegroundColor Cyan
Write-Host "ldap.server.domain=$DomainName" -ForegroundColor Cyan
Write-Host "ldap.server.bind.user=CN=$BindUser,CN=Users,DC=dgh,DC=local" -ForegroundColor Cyan
Write-Host "ldap.server.bind.password=$BindPassword" -ForegroundColor Cyan
Write-Host "ldap.server.search.base=CN=Users,DC=dgh,DC=local" -ForegroundColor Cyan

if ($successCount -eq $testUsers.Count -and $bindAuth -and $port389) {
    Write-Host "`n🎉 All tests passed! Your LDAP server is ready for use." -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some tests failed. Please check the configuration." -ForegroundColor Yellow
}

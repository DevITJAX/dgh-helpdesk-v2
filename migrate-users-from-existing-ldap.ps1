# PowerShell Script to Migrate Users from Existing LDAP Server
# This script connects to your existing LDAP server and migrates users to the new server
# Run this script as Administrator on the new Azure VM

param(
    [Parameter(Mandatory=$true)]
    [string]$SourceLdapServer,
    
    [Parameter(Mandatory=$false)]
    [string]$SourceDomain = "dgh.local",
    
    [Parameter(Mandatory=$false)]
    [string]$SourceBindUser = "CN=adminuser,CN=Users,DC=dgh,DC=local",
    
    [Parameter(Mandatory=$false)]
    [string]$SourceBindPassword = "Dgh@2025Bind!",
    
    [Parameter(Mandatory=$false)]
    [string]$TargetDomain = "dgh.local",
    
    [Parameter(Mandatory=$false)]
    [string]$LogFile = "ldap-migration.log"
)

Write-Host "Starting LDAP User Migration..." -ForegroundColor Green
Write-Host "Source Server: $SourceLdapServer" -ForegroundColor Yellow
Write-Host "Target Domain: $TargetDomain" -ForegroundColor Yellow

# Function to log messages
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Host $logMessage
    Add-Content -Path $LogFile -Value $logMessage
}

# Function to test source LDAP connection
function Test-SourceLdapConnection {
    param([string]$Server, [string]$Domain, [string]$BindUser, [string]$BindPassword)
    
    try {
        $ldapPath = "LDAP://$Server/CN=Users,DC=dgh,DC=local"
        $username = $BindUser
        $password = $BindPassword
        
        $directoryEntry = New-Object System.DirectoryServices.DirectoryEntry($ldapPath, $username, $password)
        $directorySearcher = New-Object System.DirectoryServices.DirectorySearcher($directoryEntry)
        $directorySearcher.Filter = "(objectClass=user)"
        $directorySearcher.SizeLimit = 1
        
        $results = $directorySearcher.FindAll()
        $directorySearcher.Dispose()
        $directoryEntry.Dispose()
        
        return $true
    } catch {
        Write-Log "Source LDAP connection failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Function to get users from source LDAP
function Get-SourceUsers {
    param([string]$Server, [string]$Domain, [string]$BindUser, [string]$BindPassword)
    
    $users = @()
    
    try {
        $ldapPath = "LDAP://$Server/CN=Users,DC=dgh,DC=local"
        $username = $BindUser
        $password = $BindPassword
        
        $directoryEntry = New-Object System.DirectoryServices.DirectoryEntry($ldapPath, $username, $password)
        $directorySearcher = New-Object System.DirectoryServices.DirectorySearcher($directoryEntry)
        $directorySearcher.Filter = "(&(objectClass=user)(!(objectClass=computer)))"
        $directorySearcher.PropertiesToLoad.AddRange(@("sAMAccountName", "displayName", "mail", "department", "memberOf", "userPrincipalName", "cn"))
        
        $results = $directorySearcher.FindAll()
        
        foreach ($result in $results) {
            $user = @{
                SamAccountName = $result.Properties["sAMAccountName"][0]
                DisplayName = $result.Properties["displayName"][0]
                Email = $result.Properties["mail"][0]
                Department = $result.Properties["department"][0]
                MemberOf = $result.Properties["memberOf"]
                UserPrincipalName = $result.Properties["userPrincipalName"][0]
                CN = $result.Properties["cn"][0]
            }
            $users += $user
        }
        
        $directorySearcher.Dispose()
        $directoryEntry.Dispose()
        
        Write-Log "Retrieved $($users.Count) users from source LDAP"
        return $users
        
    } catch {
        Write-Log "Failed to retrieve users from source LDAP: $($_.Exception.Message)" "ERROR"
        return @()
    }
}

# Function to get groups from source LDAP
function Get-SourceGroups {
    param([string]$Server, [string]$Domain, [string]$BindUser, [string]$BindPassword)
    
    $groups = @()
    
    try {
        $ldapPath = "LDAP://$Server/CN=Users,DC=dgh,DC=local"
        $username = $BindUser
        $password = $BindPassword
        
        $directoryEntry = New-Object System.DirectoryServices.DirectoryEntry($ldapPath, $username, $password)
        $directorySearcher = New-Object System.DirectoryServices.DirectorySearcher($directoryEntry)
        $directorySearcher.Filter = "(objectClass=group)"
        $directorySearcher.PropertiesToLoad.AddRange(@("sAMAccountName", "displayName", "description", "memberOf", "cn"))
        
        $results = $directorySearcher.FindAll()
        
        foreach ($result in $results) {
            $group = @{
                SamAccountName = $result.Properties["sAMAccountName"][0]
                DisplayName = $result.Properties["displayName"][0]
                Description = $result.Properties["description"][0]
                MemberOf = $result.Properties["memberOf"]
                CN = $result.Properties["cn"][0]
            }
            $groups += $group
        }
        
        $directorySearcher.Dispose()
        $directoryEntry.Dispose()
        
        Write-Log "Retrieved $($groups.Count) groups from source LDAP"
        return $groups
        
    } catch {
        Write-Log "Failed to retrieve groups from source LDAP: $($_.Exception.Message)" "ERROR"
        return @()
    }
}

# Function to create user on target domain
function New-TargetUser {
    param([hashtable]$User, [string]$DefaultPassword)
    
    try {
        $password = ConvertTo-SecureString -String $DefaultPassword -AsPlainText -Force
        
        $userParams = @{
            Name = $User.SamAccountName
            UserPrincipalName = $User.UserPrincipalName
            SamAccountName = $User.SamAccountName
            DisplayName = $User.DisplayName
            EmailAddress = $User.Email
            Description = "Migrated from source LDAP"
            Path = "OU=DGH_Users,DC=dgh,DC=local"
            AccountPassword = $password
            Enabled = $true
            PasswordNeverExpires = $true
        }
        
        # Add department if available
        if ($User.Department) {
            $userParams.Department = $User.Department
        }
        
        New-ADUser @userParams
        Write-Log "Created user: $($User.SamAccountName)"
        return $true
        
    } catch {
        Write-Log "Failed to create user $($User.SamAccountName): $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Function to create group on target domain
function New-TargetGroup {
    param([hashtable]$Group)
    
    try {
        $groupParams = @{
            Name = $Group.SamAccountName
            GroupCategory = "Security"
            GroupScope = "Global"
            DisplayName = $Group.DisplayName
            Description = $Group.Description
            Path = "OU=DGH_Groups,DC=dgh,DC=local"
        }
        
        New-ADGroup @groupParams
        Write-Log "Created group: $($Group.SamAccountName)"
        return $true
        
    } catch {
        Write-Log "Failed to create group $($Group.SamAccountName): $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Main migration process
Write-Log "Starting LDAP migration process"

# Test source connection
Write-Log "Testing connection to source LDAP server..."
$sourceConnected = Test-SourceLdapConnection -Server $SourceLdapServer -Domain $SourceDomain -BindUser $SourceBindUser -BindPassword $SourceBindPassword

if (-not $sourceConnected) {
    Write-Log "Cannot connect to source LDAP server. Exiting." "ERROR"
    exit 1
}

Write-Log "Source LDAP connection successful"

# Import Active Directory module
try {
    Import-Module ActiveDirectory
    Write-Log "Active Directory module loaded successfully"
} catch {
    Write-Log "Failed to load Active Directory module: $($_.Exception.Message)" "ERROR"
    exit 1
}

# Get users from source
Write-Log "Retrieving users from source LDAP..."
$sourceUsers = Get-SourceUsers -Server $SourceLdapServer -Domain $SourceDomain -BindUser $SourceBindUser -BindPassword $SourceBindPassword

if ($sourceUsers.Count -eq 0) {
    Write-Log "No users found in source LDAP" "WARNING"
} else {
    Write-Log "Found $($sourceUsers.Count) users to migrate"
    
    # Create users on target
    $defaultPassword = "Dgh@2025Migrated!"
    $createdUsers = 0
    
    foreach ($user in $sourceUsers) {
        # Skip system accounts and test accounts (we already have test accounts)
        if ($user.SamAccountName -like "test_*" -or $user.SamAccountName -like "adminuser") {
            Write-Log "Skipping $($user.SamAccountName) - already exists or is system account"
            continue
        }
        
        $created = New-TargetUser -User $user -DefaultPassword $defaultPassword
        if ($created) {
            $createdUsers++
        }
    }
    
    Write-Log "Created $createdUsers users on target domain"
}

# Get groups from source
Write-Log "Retrieving groups from source LDAP..."
$sourceGroups = Get-SourceGroups -Server $SourceLdapServer -Domain $SourceDomain -BindUser $SourceBindUser -BindPassword $SourceBindPassword

if ($sourceGroups.Count -eq 0) {
    Write-Log "No groups found in source LDAP" "WARNING"
} else {
    Write-Log "Found $($sourceGroups.Count) groups to migrate"
    
    # Create groups on target
    $createdGroups = 0
    
    foreach ($group in $sourceGroups) {
        # Skip built-in groups
        if ($group.SamAccountName -in @("Domain Admins", "Domain Users", "Domain Guests", "Enterprise Admins", "Schema Admins", "Administrators", "Users", "Guests")) {
            Write-Log "Skipping $($group.SamAccountName) - built-in group"
            continue
        }
        
        $created = New-TargetGroup -Group $group
        if ($created) {
            $createdGroups++
        }
    }
    
    Write-Log "Created $createdGroups groups on target domain"
}

# Display migration summary
Write-Log "Migration completed"
Write-Log "Users migrated: $createdUsers"
Write-Log "Groups migrated: $createdGroups"
Write-Log "Default password for migrated users: $defaultPassword"

Write-Host "`n=== Migration Summary ===" -ForegroundColor Yellow
Write-Host "Users migrated: $createdUsers" -ForegroundColor White
Write-Host "Groups migrated: $createdGroups" -ForegroundColor White
Write-Host "Log file: $LogFile" -ForegroundColor White
Write-Host "Default password for migrated users: $defaultPassword" -ForegroundColor White

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Test authentication with migrated users" -ForegroundColor White
Write-Host "2. Update user passwords as needed" -ForegroundColor White
Write-Host "3. Assign users to appropriate groups" -ForegroundColor White
Write-Host "4. Test your application with the new LDAP server" -ForegroundColor White

Write-Host "`nMigration completed successfully!" -ForegroundColor Green

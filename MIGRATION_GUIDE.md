# DGH HelpDesk - Azure to VMware Migration Guide

This guide provides step-by-step instructions to migrate the DGH HelpDesk system from Azure Container Instances to a VMware virtual machine with Active Directory integration.

## 📋 Prerequisites

### VMware Server Requirements
- **OS**: Windows Server 2019/2022 or Ubuntu 20.04/22.04 LTS
- **RAM**: Minimum 8GB (16GB recommended)
- **CPU**: 4+ cores
- **Storage**: 100GB+ available space
- **Network**: Static IP address, internet connectivity

### Software Requirements
- Docker Desktop or Docker Engine
- Docker Compose
- Git
- Active Directory Domain Services (if not already configured)

## 🏗️ Phase 1: VMware Server Setup

### 1.1 Install Docker on VMware Server

#### For Windows Server:
```powershell
# Install Docker Desktop for Windows
# Download from: https://www.docker.com/products/docker-desktop/

# Or install Docker Engine via PowerShell
Invoke-WebRequest -Uri "https://get.docker.com" -OutFile "install-docker.ps1"
.\install-docker.ps1

# Start Docker service
Start-Service docker
```

#### For Ubuntu Server:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker
```

### 1.2 Configure Network and Firewall

#### Windows Server (PowerShell as Administrator):
```powershell
# Configure Windows Firewall
New-NetFirewallRule -DisplayName "DGH HelpDesk Backend" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow
New-NetFirewallRule -DisplayName "DGH HelpDesk Frontend" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
New-NetFirewallRule -DisplayName "DGH HelpDesk HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow

# Set static IP (replace with your network details)
New-NetIPAddress -IPAddress "192.168.1.100" -PrefixLength 24 -DefaultGateway "192.168.1.1" -InterfaceIndex (Get-NetAdapter).InterfaceIndex
Set-DnsClientServerAddress -InterfaceIndex (Get-NetAdapter).InterfaceIndex -ServerAddresses "192.168.1.1","8.8.8.8"
```

#### Ubuntu Server:
```bash
# Configure UFW firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8080/tcp  # Backend API
sudo ufw --force enable

# Configure static IP (edit /etc/netplan/00-installer-config.yaml)
sudo nano /etc/netplan/00-installer-config.yaml
```

Example netplan configuration:
```yaml
network:
  version: 2
  ethernets:
    eth0:
      addresses:
        - 192.168.1.100/24
      gateway4: 192.168.1.1
      nameservers:
        addresses: [192.168.1.1, 8.8.8.8]
```

Apply configuration:
```bash
sudo netplan apply
```

## 🏛️ Phase 2: Active Directory Setup

### 2.1 Install Active Directory Domain Services (Windows Server)

```powershell
# Install AD DS role
Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools

# Install DNS Server
Install-WindowsFeature -Name DNS -IncludeManagementTools

# Promote server to domain controller
Install-ADDSForest -DomainName "dgh.local" -DomainNetbiosName "DGH" -InstallDns -CreateDnsDelegation:$false -DatabasePath "C:\Windows\NTDS" -LogPath "C:\Windows\NTDS" -SysvolPath "C:\Windows\SYSVOL" -Force
```

### 2.2 Create Organizational Units and Users

```powershell
# Create OUs
New-ADOrganizationalUnit -Name "IT Department" -Path "DC=dgh,DC=local"
New-ADOrganizationalUnit -Name "HelpDesk Users" -Path "OU=IT Department,DC=dgh,DC=local"
New-ADOrganizationalUnit -Name "Technicians" -Path "OU=HelpDesk Users,OU=IT Department,DC=dgh,DC=local"
New-ADOrganizationalUnit -Name "Employees" -Path "OU=HelpDesk Users,OU=IT Department,DC=dgh,DC=local"

# Create service account for LDAP binding
New-ADUser -Name "helpdesk-bind" -SamAccountName "helpdesk-bind" -UserPrincipalName "helpdesk-bind@dgh.local" -Path "OU=IT Department,DC=dgh,DC=local" -AccountPassword (ConvertTo-SecureString "Dgh@2025Bind!" -AsPlainText -Force) -Enabled $true

# Create admin user
New-ADUser -Name "admin" -SamAccountName "admin" -UserPrincipalName "admin@dgh.local" -Path "OU=IT Department,DC=dgh,DC=local" -AccountPassword (ConvertTo-SecureString "admin123" -AsPlainText -Force) -Enabled $true

# Create technician users
New-ADUser -Name "tech1" -SamAccountName "tech1" -UserPrincipalName "tech1@dgh.local" -Path "OU=Technicians,OU=HelpDesk Users,OU=IT Department,DC=dgh,DC=local" -AccountPassword (ConvertTo-SecureString "tech123" -AsPlainText -Force) -Enabled $true

New-ADUser -Name "tech2" -SamAccountName "tech2" -UserPrincipalName "tech2@dgh.local" -Path "OU=Technicians,OU=HelpDesk Users,OU=IT Department,DC=dgh,DC=local" -AccountPassword (ConvertTo-SecureString "tech123" -AsPlainText -Force) -Enabled $true

# Create employee users
New-ADUser -Name "user1" -SamAccountName "user1" -UserPrincipalName "user1@dgh.local" -Path "OU=Employees,OU=HelpDesk Users,OU=IT Department,DC=dgh,DC=local" -AccountPassword (ConvertTo-SecureString "user123" -AsPlainText -Force) -Enabled $true

New-ADUser -Name "user2" -SamAccountName "user2" -UserPrincipalName "user2@dgh.local" -Path "OU=Employees,OU=HelpDesk Users,OU=IT Department,DC=dgh,DC=local" -AccountPassword (ConvertTo-SecureString "user123" -AsPlainText -Force) -Enabled $true

# Add users to appropriate groups
Add-ADGroupMember -Identity "Domain Admins" -Members "admin"
Add-ADGroupMember -Identity "Domain Users" -Members "tech1","tech2","user1","user2"
```

### 2.3 Configure LDAP Permissions

```powershell
# Grant read permissions to helpdesk-bind account
dsacls "CN=Users,DC=dgh,DC=local" /G "dgh\helpdesk-bind:RP"

# Grant read permissions to IT Department OU
dsacls "OU=IT Department,DC=dgh,DC=local" /G "dgh\helpdesk-bind:RP"

# Test LDAP connectivity
ldapsearch -H ldap://localhost:389 -D "CN=helpdesk-bind,OU=IT Department,DC=dgh,DC=local" -w "Dgh@2025Bind!" -b "DC=dgh,DC=local" "(objectClass=user)"
```

## 🐳 Phase 3: Application Migration

### 3.1 Clone Repository on VMware Server

```bash
# Clone the repository
git clone <your-repository-url>
cd dgh-helpdesk-main

# Or if using Windows
git clone <your-repository-url>
cd dgh-helpdesk-main
```

### 3.2 Create Production Configuration

Create `backend/src/main/resources/application-vmware.properties`:

```properties
# VMware Production Configuration
spring.profiles.active=vmware

# Database Configuration (PostgreSQL for production)
spring.datasource.url=jdbc:postgresql://localhost:5432/dgh_helpdesk
spring.datasource.driverClassName=org.postgresql.Driver
spring.datasource.username=dgh_helpdesk
spring.datasource.password=Dgh@2025DB!

# JPA/Hibernate Configuration
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false

# LDAP Configuration for VMware AD
ldap.server.url=ldap://localhost:389
ldap.server.domain=dgh.local
ldap.server.bind.user=CN=helpdesk-bind,OU=IT Department,DC=dgh,DC=local
ldap.server.bind.password=Dgh@2025Bind!
ldap.server.search.base=OU=IT Department,DC=dgh,DC=local

# Production logging
logging.level.org.springframework.security=INFO
logging.level.org.springframework.ldap=INFO
logging.level.ma.gov.dgh.helpdesk=INFO
logging.level.org.hibernate.SQL=WARN

# Security settings
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.same-site=Strict

# JWT Settings
app.jwtSecret=dgh-helpdesk-vmware-production-jwt-secret-key-2024-secure
app.jwtExpirationInMs=86400000

# Network Discovery Configuration
network.discovery.enabled=true
network.discovery.scan-interval=3600000
network.discovery.subnet-ranges=192.168.1.0/24,10.0.0.0/8
network.discovery.snmp.community=public
network.discovery.snmp.timeout=5000
```

### 3.3 Setup PostgreSQL Database

#### Install PostgreSQL:

**Windows Server:**
```powershell
# Download and install PostgreSQL
# Download from: https://www.postgresql.org/download/windows/

# Or use Chocolatey
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
choco install postgresql --params '/Password:postgres'
```

**Ubuntu Server:**
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib -y

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to postgres user and create database
sudo -u postgres psql
```

#### Create Database and User:
```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE dgh_helpdesk;
CREATE USER dgh_helpdesk WITH PASSWORD 'Dgh@2025DB!';
GRANT ALL PRIVILEGES ON DATABASE dgh_helpdesk TO dgh_helpdesk;
GRANT ALL ON SCHEMA public TO dgh_helpdesk;
\q
```

### 3.4 Update Docker Compose for VMware

Create `docker-compose-vmware.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: dgh-postgres
    environment:
      POSTGRES_DB: dgh_helpdesk
      POSTGRES_USER: dgh_helpdesk
      POSTGRES_PASSWORD: Dgh@2025DB!
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/data/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dgh_helpdesk -d dgh_helpdesk"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: dgh-backend
    environment:
      SPRING_PROFILES_ACTIVE: vmware
      JAVA_OPTS: -XX:MaxRAMPercentage=75
    ports:
      - "8080:8080"
    volumes:
      - ./backend/src/main/resources:/app/config:ro
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-q", "-O", "-", "http://localhost:8080/actuator/health/liveness"]
      interval: 15s
      timeout: 5s
      retries: 5
      start_period: 40s

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        REACT_APP_API_BASE_URL: http://192.168.1.100:8080
    container_name: dgh-frontend
    environment:
      REACT_APP_API_BASE_URL: http://192.168.1.100:8080
    depends_on:
      backend:
        condition: service_healthy
    ports:
      - "80:80"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-q", "-O", "-", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s

volumes:
  postgres_data:
```

### 3.5 Update Backend Dependencies

Add PostgreSQL dependency to `backend/pom.xml`:

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

### 3.6 Deploy Application

```bash
# Build and start services
docker-compose -f docker-compose-vmware.yml up -d --build

# Check service status
docker-compose -f docker-compose-vmware.yml ps

# View logs
docker-compose -f docker-compose-vmware.yml logs -f

# Check health
curl http://localhost:8080/actuator/health
curl http://localhost/health
```

## 🔧 Phase 4: Data Migration

### 4.1 Export Data from Azure (if needed)

If you have existing data in Azure, export it first:

```bash
# Connect to Azure container
az container exec -g <resource-group> -n <container-name> -- bash

# Export H2 database (if using H2 in Azure)
# This would need to be done before migration
```

### 4.2 Import Initial Data

Create `backend/data/init.sql`:

```sql
-- Insert initial users (these will be overridden by LDAP)
INSERT INTO users (id, username, email, first_name, last_name, role, department, is_active, created_at, updated_at) VALUES
(1, 'admin', 'admin@dgh.local', 'System', 'Administrator', 'ADMIN', 'IT Department', true, NOW(), NOW()),
(2, 'tech1', 'tech1@dgh.local', 'Technician', 'One', 'TECHNICIAN', 'IT Department', true, NOW(), NOW()),
(3, 'user1', 'user1@dgh.local', 'Employee', 'One', 'EMPLOYEE', 'IT Department', true, NOW(), NOW());

-- Insert sample tickets
INSERT INTO tickets (id, title, description, status, priority, category, created_by, assigned_to, created_at, updated_at) VALUES
(1, 'Sample Ticket 1', 'This is a sample ticket for testing', 'OPEN', 'MEDIUM', 'Hardware', 3, 2, NOW(), NOW()),
(2, 'Sample Ticket 2', 'Another sample ticket', 'IN_PROGRESS', 'HIGH', 'Software', 3, 2, NOW(), NOW());

-- Insert sample equipment
INSERT INTO equipment (id, name, equipment_type, status, location, ip_address, created_at, updated_at) VALUES
(1, 'Server-01', 'SERVER', 'ONLINE', 'Data Center', '192.168.1.10', NOW(), NOW()),
(2, 'Switch-01', 'NETWORK', 'ONLINE', 'Network Rack', '192.168.1.1', NOW(), NOW());
```

## 🔒 Phase 5: Security Configuration

### 5.1 Configure SSL/TLS (Optional but Recommended)

#### Generate SSL Certificate:

```bash
# Create SSL directory
mkdir -p ssl

# Generate self-signed certificate (for testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/dgh-helpdesk.key \
  -out ssl/dgh-helpdesk.crt \
  -subj "/C=MA/ST=Morocco/L=Rabat/O=DGH/OU=IT Department/CN=dgh.local"

# Or use Let's Encrypt for production
sudo apt install certbot -y
sudo certbot certonly --standalone -d dgh.local
```

#### Update Nginx Configuration:

Create `frontend/nginx-vmware.conf`:

```nginx
server {
    listen 80;
    server_name dgh.local;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dgh.local;

    ssl_certificate /etc/ssl/certs/dgh-helpdesk.crt;
    ssl_certificate_key /etc/ssl/private/dgh-helpdesk.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # API proxy
    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 5.2 Configure Firewall Rules

```bash
# Ubuntu UFW
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8080/tcp  # Backend API (internal only)
sudo ufw allow 5432/tcp  # PostgreSQL (internal only)
sudo ufw --force enable

# Windows PowerShell
New-NetFirewallRule -DisplayName "DGH HelpDesk HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
New-NetFirewallRule -DisplayName "DGH HelpDesk HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
New-NetFirewallRule -DisplayName "DGH HelpDesk Backend" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow -RemoteAddress "192.168.1.0/24"
```

## 🚀 Phase 6: Final Deployment and Testing

### 6.1 Deploy with SSL

```bash
# Update docker-compose to include SSL
docker-compose -f docker-compose-vmware.yml down
docker-compose -f docker-compose-vmware.yml up -d --build

# Check all services
docker-compose -f docker-compose-vmware.yml ps
docker-compose -f docker-compose-vmware.yml logs
```

### 6.2 Test Application

```bash
# Test backend health
curl -k https://dgh.local/api/health

# Test frontend
curl -k https://dgh.local/health

# Test LDAP authentication
curl -X POST https://dgh.local/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 6.3 Create Startup Scripts

Create `start-dgh-helpdesk.sh`:

```bash
#!/bin/bash
# DGH HelpDesk Startup Script

echo "Starting DGH HelpDesk Services..."

# Start Docker if not running
sudo systemctl start docker

# Navigate to application directory
cd /opt/dgh-helpdesk-main

# Start services
docker-compose -f docker-compose-vmware.yml up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# Check service health
echo "Checking service health..."
curl -f http://localhost:8080/actuator/health || echo "Backend not ready"
curl -f http://localhost/health || echo "Frontend not ready"

echo "DGH HelpDesk started successfully!"
echo "Access the application at: https://dgh.local"
```

Make it executable:
```bash
chmod +x start-dgh-helpdesk.sh
```

### 6.4 Create Systemd Service (Ubuntu)

Create `/etc/systemd/system/dgh-helpdesk.service`:

```ini
[Unit]
Description=DGH HelpDesk Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/dgh-helpdesk-main
ExecStart=/opt/dgh-helpdesk-main/start-dgh-helpdesk.sh
ExecStop=/usr/local/bin/docker-compose -f /opt/dgh-helpdesk-main/docker-compose-vmware.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Enable and start service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable dgh-helpdesk
sudo systemctl start dgh-helpdesk
```

## 📊 Phase 7: Monitoring and Maintenance

### 7.1 Setup Log Rotation

Create `/etc/logrotate.d/dgh-helpdesk`:

```
/opt/dgh-helpdesk-main/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose -f /opt/dgh-helpdesk-main/docker-compose-vmware.yml restart
    endscript
}
```

### 7.2 Create Backup Script

Create `backup-dgh-helpdesk.sh`:

```bash
#!/bin/bash
# DGH HelpDesk Backup Script

BACKUP_DIR="/opt/backups/dgh-helpdesk"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="dgh-helpdesk-backup-$DATE.tar.gz"

mkdir -p $BACKUP_DIR

# Backup database
docker-compose -f /opt/dgh-helpdesk-main/docker-compose-vmware.yml exec -T postgres pg_dump -U dgh_helpdesk dgh_helpdesk > $BACKUP_DIR/database-$DATE.sql

# Backup application data
tar -czf $BACKUP_DIR/$BACKUP_FILE /opt/dgh-helpdesk-main/data

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
```

### 7.3 Setup Cron Jobs

```bash
# Add to crontab
crontab -e

# Add these lines:
# Daily backup at 2 AM
0 2 * * * /opt/dgh-helpdesk-main/backup-dgh-helpdesk.sh

# Weekly log rotation
0 3 * * 0 /usr/sbin/logrotate /etc/logrotate.d/dgh-helpdesk
```

## ✅ Verification Checklist

- [ ] VMware server configured with static IP
- [ ] Docker and Docker Compose installed
- [ ] Active Directory domain controller configured
- [ ] LDAP users and groups created
- [ ] PostgreSQL database installed and configured
- [ ] Application deployed and running
- [ ] SSL certificates configured (optional)
- [ ] Firewall rules configured
- [ ] Backup procedures in place
- [ ] Monitoring and logging configured
- [ ] All services accessible via web browser
- [ ] LDAP authentication working
- [ ] All user roles functioning correctly

## 🔧 Troubleshooting

### Common Issues:

1. **LDAP Connection Failed**
   ```bash
   # Test LDAP connectivity
   ldapsearch -H ldap://localhost:389 -D "CN=helpdesk-bind,OU=IT Department,DC=dgh,DC=local" -w "Dgh@2025Bind!" -b "DC=dgh,DC=local" "(objectClass=user)"
   ```

2. **Database Connection Failed**
   ```bash
   # Check PostgreSQL status
   docker-compose -f docker-compose-vmware.yml logs postgres
   ```

3. **Frontend Not Loading**
   ```bash
   # Check frontend logs
   docker-compose -f docker-compose-vmware.yml logs frontend
   ```

4. **Services Not Starting**
   ```bash
   # Check all service logs
   docker-compose -f docker-compose-vmware.yml logs
   ```

## 📞 Support

For additional support or questions about the migration process, refer to the main README.md or contact the DGH IT Department.

---

**Migration completed successfully!** 🎉

Your DGH HelpDesk system is now running on VMware with Active Directory integration.

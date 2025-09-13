# DGH HelpDesk - IT Support Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://openjdk.java.net/)

**Direction Générale de l'Hydraulique** - Ministry of Equipment and Water, Morocco

A comprehensive IT helpdesk management system designed for government institutions, featuring role-based access control, ticket management, equipment monitoring, and comprehensive activity logging.

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**Copyright © 2025 Direction Générale de l'Hydraulique - Ministry of Equipment and Water, Morocco**

### **Open Source Dependencies**

This project uses open source libraries under various licenses:

- **Apache License 2.0**: Spring Framework, JJWT, SNMP4J, Jackson, Apache Commons, Maven
- **MIT License**: React, Material-UI, React Router, Axios, Recharts, Emotion
- **MPL 2.0 / EPL 1.0**: H2 Database
- **2-clause BSD**: Nginx
- **GPL v2 + CE**: Eclipse Temurin

All dependencies are used in compliance with their respective licenses.

## 🏛️ **Project Overview**

The DGH HelpDesk is a modern, secure IT support management system built for the Moroccan Ministry of Equipment and Water. It provides a complete solution for managing IT support requests, user administration, equipment monitoring, and system auditing with government-grade security and compliance features.

### **Key Features**
- 🔐 **LDAP Authentication** - Secure government domain integration
- 👥 **Role-Based Access Control** - Admin, Technician, and Employee roles
- 🎫 **Ticket Management** - Complete lifecycle from creation to resolution
- 📊 **Real-time Dashboards** - Role-specific analytics and monitoring
- 🔍 **Activity Logging** - Comprehensive audit trail for security compliance
- 🖥️ **Equipment Monitoring** - SNMP-based network device discovery
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- 🏛️ **Government Compliance** - Moroccan government standards and branding

## 🏗️ **Architecture Deep Dive**

### **Technology Stack**

#### **Frontend Architecture**
- **React 18.2.0** - Modern functional components with hooks
- **Material-UI (MUI) v5.14.17** - Professional government-appropriate design system
- **React Router v6.18.0** - Client-side routing with protected routes
- **Axios v1.6.0** - HTTP client for API communication with interceptors
- **Recharts v3.1.0** - Data visualization for dashboards and analytics
- **React Context** - Global state management for authentication and user data
- **Custom Hooks** - Reusable logic for API calls and state management
- **Nginx** - Production web server with SPA routing support

#### **Backend Architecture**
- **Spring Boot 3.5.3** - Java-based REST API with modern Spring features
- **Java 17** - Latest LTS version with modern language features
- **Spring Security** - Comprehensive authentication and authorization
- **Spring Data JPA** - Database operations with Hibernate
- **H2 Database** - Development database with file persistence
- **LDAP Integration** - Active Directory authentication for government domain
- **JWT Tokens (JJWT 0.11.5)** - Secure session management with refresh tokens
- **SNMP4J v3.7.7** - Network device discovery and monitoring
- **Spring Actuator** - Health monitoring and metrics
- **Apache Commons** - Utility libraries for networking and validation

### **Database Schema Analysis**

#### **Core Entities**

**User Entity** (`ma.gov.dgh.helpdesk.entity.User`)
- **LDAP Integration**: Synchronized with government Active Directory
- **Role Management**: ADMIN, TECHNICIAN, EMPLOYEE roles
- **Department Tracking**: Government department organization
- **Activity Tracking**: Last login and session management
- **Relationships**: One-to-many with tickets and comments

**Ticket Entity** (`ma.gov.dgh.helpdesk.entity.Ticket`)
- **Lifecycle Management**: Creation, assignment, resolution tracking
- **Priority System**: CRITICAL, HIGH, MEDIUM, LOW priorities
- **Status Tracking**: OPEN, IN_PROGRESS, RESOLVED, CLOSED
- **SLA Management**: Due dates and escalation handling
- **Equipment Association**: Links to specific IT equipment
- **Time Tracking**: Estimated vs actual hours
- **Customer Satisfaction**: 1-5 rating system

**Equipment Entity** (`ma.gov.dgh.helpdesk.entity.Equipment`)
- **SNMP Monitoring**: Network device discovery and status
- **Inventory Management**: Asset tracking and categorization
- **Status Tracking**: ONLINE, OFFLINE, MAINTENANCE, RETIRED
- **Location Tracking**: Physical location and network location
- **Maintenance History**: Service records and warranty information

**ActivityLog Entity** (`ma.gov.dgh.helpdesk.entity.ActivityLog`)
- **Comprehensive Audit Trail**: All system activities logged
- **Security Events**: Login attempts, suspicious activities
- **User Actions**: Ticket operations, user management
- **IP Tracking**: Source IP address for security monitoring
- **Session Correlation**: Link activities to user sessions

#### **Enums & Types**

**UserRole** - Role-based access control
- `ADMIN` - Full system access and administration
- `TECHNICIAN` - Ticket resolution and equipment access
- `EMPLOYEE` - Ticket creation and status tracking

**TicketStatus** - Ticket lifecycle management
- `OPEN` - New ticket awaiting assignment
- `IN_PROGRESS` - Active work in progress
- `RESOLVED` - Completed with resolution
- `CLOSED` - Final closure after verification

**TicketPriority** - SLA and escalation management
- `CRITICAL` - Immediate attention required
- `HIGH` - Urgent business impact
- `MEDIUM` - Standard priority
- `LOW` - Non-urgent requests

**LogSeverity** - Activity log classification
- `ERROR` - System errors and failures
- `WARNING` - Potential issues and alerts
- `SUCCESS` - Successful operations
- `INFO` - General information and tracking

## 🎯 **Role-Based System Architecture**

### **Admin (ROLE_ADMIN) - Full System Control**

**Dashboard Features** (`AdminDashboard.js`)
- **Global Statistics**: System-wide metrics and trends
- **Ticket Distribution**: Visual charts and analytics
- **Technician Performance**: Individual and team metrics
- **Equipment Status**: Network device monitoring
- **Activity Log**: Real-time system audit trail
- **Quick Actions**: User creation, ticket assignment, reports

**System Management**
- **User Administration**: Create, edit, and manage all users
- **Role Assignment**: Assign and modify user roles
- **Department Management**: Organize users by government departments
- **System Configuration**: LDAP settings, SLA configuration
- **Security Monitoring**: Failed login detection and alerts

**Analytics & Reporting**
- **Performance Metrics**: Technician productivity analysis
- **SLA Compliance**: Service level agreement monitoring
- **Trend Analysis**: Historical data and forecasting
- **Export Capabilities**: Compliance and audit reports

### **Technician (ROLE_TECHNICIAN) - Support Operations**

**Dashboard Features** (`TechnicianDashboard.js`)
- **Personal Workload**: Assigned tickets and priorities
- **SLA Alerts**: Urgent ticket notifications
- **Performance Stats**: Resolution times and compliance
- **Recent Assignments**: Latest ticket updates
- **Weekly Trends**: Personal productivity analytics

**Operational Capabilities**
- **Ticket Resolution**: Handle assigned support requests
- **Equipment Access**: View-only equipment monitoring
- **Knowledge Base**: Access to technical documentation
- **Time Tracking**: Log hours spent on tickets
- **Communication**: Comment on tickets and update status

**Performance Tracking**
- **Resolution Metrics**: Average time to resolution
- **SLA Compliance**: Meeting service level agreements
- **Customer Satisfaction**: Rating tracking and improvement
- **Workload Management**: Balanced ticket distribution

### **Employee (ROLE_USER) - End User Interface**

**Dashboard Features** (`EmployeeDashboard.js`)
- **My Tickets**: Personal support request overview
- **Quick Creation**: Easy ticket submission
- **Status Updates**: Real-time ticket progress
- **Knowledge Base**: Self-service recommendations
- **Recent Activity**: Personal ticket history

**User Capabilities**
- **Ticket Creation**: Submit support requests
- **Status Tracking**: Monitor ticket progress
- **Communication**: Comment on tickets
- **Profile Management**: Update personal information
- **Self-Service**: Access knowledge base articles

## 📊 **Dashboard Architecture Analysis**

### **Admin Dashboard** (`AdminDashboard.js` - 43KB, 1150 lines)

**Component Structure**
- Main dashboard with role-based rendering
- Statistics overview and analytics components
- Ticket analytics and performance metrics
- Equipment monitoring and activity logs
- Quick actions and administrative tools

**Key Features**
- **Real-time Statistics**: Live data updates via API polling
- **Interactive Charts**: Recharts integration for data visualization
- **Advanced Filtering**: Date ranges, departments, status filters
- **Export Functionality**: PDF and Excel report generation
- **Responsive Design**: Mobile-first approach with Material-UI

**Analytics Components**
- **Ticket Distribution**: Pie charts and bar graphs
- **Performance Metrics**: Line charts for trends
- **Equipment Status**: Real-time network monitoring
- **User Activity**: Heat maps and activity graphs

### **Technician Dashboard** (`TechnicianDashboard.js` - 14KB, 376 lines)

**Personalized Interface**
- **Workload Overview**: Assigned tickets with priorities
- **SLA Alerts**: Color-coded urgency indicators
- **Performance Tracking**: Personal metrics and goals
- **Quick Actions**: Status updates and time logging

**Productivity Features**
- **Time Tracking**: Log hours spent on tickets
- **SLA Monitoring**: Real-time deadline tracking
- **Communication Tools**: Quick comment and update features
- **Knowledge Access**: Integrated technical documentation

### **Employee Dashboard** (`EmployeeDashboard.js` - 7.3KB, 248 lines)

**User-Centric Design**
- **Ticket Overview**: Personal support request summary
- **Quick Creation**: Streamlined ticket submission
- **Status Tracking**: Visual progress indicators
- **Self-Service**: Knowledge base integration

## 🔍 **Activity Logging System Architecture**

### **Comprehensive Audit Trail** (`ActivityLog.java`)

**Log Categories**
- **Authentication Events**: Login, logout, failed attempts
- **Ticket Operations**: Creation, updates, assignments, resolution
- **User Management**: Account creation, updates, role changes
- **System Changes**: Configuration modifications
- **Security Events**: Suspicious activities and alerts
- **Equipment Discovery**: Network device monitoring

**Security Features**
- **IP Address Tracking**: Monitor access patterns and locations
- **Session Correlation**: Link activities to user sessions
- **Suspicious Activity Detection**: Multiple failed login alerts
- **Export Capabilities**: Compliance reporting and audit trails
- **Real-time Monitoring**: Live activity dashboard

**Admin Monitoring Interface**
- **Advanced Filtering**: Search by user, action, severity, date
- **Pagination**: Handle large datasets efficiently
- **Export Functionality**: Compliance and audit reports
- **Statistics Overview**: Activity trends and patterns
- **Security Alerts**: Failed login and suspicious activity detection

## 🎨 **UI/UX Design Architecture**

### **Professional Government Branding**

**Design System**
- **DGH Logo Integration**: Official branding throughout application
- **Material Design**: Professional, accessible interface
- **Responsive Layout**: Mobile-first design approach
- **Government Colors**: Official blue theme (#1976d2)
- **Bilingual Support**: French and Arabic text support

**Enhanced Login Experience** (`Login.js` - 9.6KB, 341 lines)
- **Centered Design**: Perfect vertical and horizontal centering
- **Gradient Background**: Professional blue gradient
- **Glass Morphism**: Modern semi-transparent effects
- **Large Logo Display**: Prominent DGH branding
- **Professional Typography**: Government-appropriate styling

**Navigation & Layout** (`Layout.js`)
- **Sidebar Navigation**: Role-based menu system
- **App Bar Integration**: Logo and user profile access
- **Mobile Responsive**: Drawer navigation on mobile
- **Breadcrumb Navigation**: Clear page hierarchy
- **Quick Actions**: Context-sensitive buttons

### **Component Architecture**

**Protected Routes** (`ProtectedRoute.js`, `RoleBasedRoute.js`)
- Authentication and authorization middleware
- Role-based component rendering
- Secure route protection for different user roles

**Feature-Based Organization**
- Authentication and user management modules
- Role-specific dashboard components
- Ticket management system
- User administration (admin only)
- Equipment monitoring and knowledge base system

## 🚀 **Quick Start Guide**

### **Prerequisites**

Before starting, ensure you have the following installed:

| Tool | Version | Purpose |
|------|---------|---------|
| **Java** | 17+ | Backend runtime and development |
| **Node.js** | 18+ | Frontend development and build |
| **Maven** | 3.6+ | Backend build tool |
| **Docker** | 20+ | Containerized development (optional) |
| **Git** | Latest | Version control |

### **Option 1: Docker Development (Recommended)**

The fastest way to get started is using Docker Compose:

```bash
# Clone the repository
git clone <repository-url>
cd dgh-helpdesk-main

# Start both services with Docker Compose
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

**Access Points:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **H2 Database Console**: http://localhost:8080/h2-console

### **Option 2: Local Development Setup**

#### **Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Install dependencies and run
mvn clean install
mvn spring-boot:run

# Alternative: Run with specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

**Backend Configuration** (`src/main/resources/application.properties`):
- Database Configuration: H2 database for development with console enabled
- LDAP Configuration: Development mode LDAP settings
- JWT Settings: Secret key and expiration time configuration
- SNMP Configuration: Community string, timeout, and retry settings
- Server Configuration: Port 8080 with health monitoring endpoints

#### **Frontend Setup**

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Alternative: Build for production
npm run build
```

**Frontend Configuration** (`.env` file):
- API Configuration: Backend API base URL
- Development settings: Source map generation control

### **Initial Setup & Configuration**

#### **1. Database Initialization**

The H2 database will be automatically created with initial data:
- Default users are created automatically
- Admin: admin / admin123
- Technician: tech / tech123  
- Employee: user / user123

#### **2. LDAP Configuration (Optional)**

For production or LDAP-enabled development:
- Update application.properties with LDAP server URL
- Configure LDAP base DN and admin credentials
- Set appropriate LDAP username and password

#### **3. Network Discovery Setup**

Configure SNMP settings for equipment monitoring:
- SNMP community string configuration
- Timeout and retry settings
- Port configuration for SNMP communication

### **Default Login Credentials**

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| **Admin** | `admin` | `admin123` | Full system access |
| **Technician** | `tech` | `tech123` | Ticket resolution & equipment |
| **Employee** | `user` | `user123` | Ticket creation & tracking |

### **Development Workflow**

#### **Backend Development**
```bash
# Run with hot reload (if using IDE)
mvn spring-boot:run

# Run tests
mvn test

# Build JAR
mvn clean package

# Check application health
curl http://localhost:8080/actuator/health
```

#### **Frontend Development**
```bash
# Start with hot reload
npm start

# Run tests
npm test

# Build for production
npm run build

# Analyze bundle size
npm run build -- --analyze
```

### **Useful Development Commands**

```bash
# View all running containers
docker-compose ps

# Restart specific service
docker-compose restart backend

# View service logs
docker-compose logs -f frontend

# Stop all services
docker-compose down

# Clean up (remove volumes)
docker-compose down -v

# Rebuild and start
docker-compose up --build -d
```

### **Troubleshooting Common Issues**

#### **Port Conflicts**
```bash
# Check if ports are in use
netstat -tulpn | grep :8080
netstat -tulpn | grep :3000

# Kill process using port (Linux/Mac)
sudo lsof -ti:8080 | xargs kill -9
```

#### **Database Issues**
```bash
# Reset H2 database
rm -rf backend/data/dgh_helpdesk.*

# Access H2 console
# URL: http://localhost:8080/h2-console
# JDBC URL: jdbc:h2:file:./data/dgh_helpdesk
# Username: sa
# Password: password
```

#### **Frontend Build Issues**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## ⚙️ **Deployment & CI/CD Pipeline**

### **Automated Deployment Architecture**

The DGH HelpDesk system features a robust CI/CD pipeline that automatically builds and deploys the application to Azure cloud infrastructure.

#### **Pipeline Overview**
```
GitHub Repository → GitHub Actions → Azure Container Registry → Azure Container Instances
```

#### **CI/CD Workflow** (`.github/workflows/deploy.yml`)

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch

**Build Process:**
1. **Backend Build**: Multi-stage Docker build using Maven and Eclipse Temurin 17
2. **Frontend Build**: Multi-stage Docker build using Node.js 20 and Nginx
3. **Image Push**: Both images pushed to Azure Container Registry with `latest` tag

**Deployment Process:**
1. **Azure Authentication**: Service principal authentication
2. **Container Restart**: Automated restart of Azure Container Instances
3. **Health Checks**: Built-in health monitoring and restart policies

#### **Required GitHub Secrets**

Configure these secrets in your GitHub repository (Settings → Secrets and variables → Actions):

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `ACR_LOGIN_SERVER` | Azure Container Registry URL | `myregistrydgh.azurecr.io` |
| `ACR_USERNAME` | ACR admin username | `dghregistry` |
| `ACR_PASSWORD` | ACR admin password | `[secure-password]` |
| `AZURE_CREDENTIALS` | Service principal JSON | `{"clientId":"...","clientSecret":"..."}` |
| `RESOURCE_GROUP` | Azure resource group | `DGH` |
| `ACI_BACKEND_NAME` | Backend container name | `dgh-backend` |
| `ACI_FRONTEND_NAME` | Frontend container name | `dgh-frontend` |
| `FRONTEND_API_URL` | Backend API URL for frontend | `http://dgh-backend-unique.eastus.azurecontainer.io:8080` |

#### **Docker Configuration**

**Backend Dockerfile:**
- **Build Stage**: Maven 3.9 with Eclipse Temurin 17
- **Runtime Stage**: Eclipse Temurin 17 JRE Alpine
- **Security**: Non-root user execution
- **Optimization**: Multi-stage build for smaller image size
- **Health Check**: Spring Actuator health endpoint

**Frontend Dockerfile:**
- **Build Stage**: Node.js 20 Alpine with React build
- **Runtime Stage**: Nginx 1.27 Alpine
- **Features**: SPA routing support, health checks
- **Configuration**: Environment-based API URL injection

#### **Local Development**

For local development, use the provided `docker-compose.yml`:

```bash
# Start both services locally
docker-compose up -d

# Backend: http://localhost:8080
# Frontend: http://localhost:3000
```

**Local Development Features:**
- **Volume Mounting**: Persistent H2 database and configuration files
- **Health Checks**: Automatic service dependency management
- **Hot Reload**: Development-friendly configuration
- **Environment Variables**: Easy configuration management

#### **Production Deployment Notes**

- **API URL Configuration**: Frontend API URL is baked at build time via `REACT_APP_API_BASE_URL`
- **Container Restart**: Automatic restart policies for high availability
- **Resource Management**: Optimized memory allocation with `-XX:MaxRAMPercentage=75`
- **Security**: Non-root container execution and minimal attack surface
- **Monitoring**: Built-in health checks and Azure monitoring integration

## 🔧 **API Architecture**

### **RESTful Endpoints**

The DGH HelpDesk API follows RESTful conventions with comprehensive CRUD operations, pagination, filtering, and role-based access control.

#### **Authentication** (`AuthController.java`)
- POST /api/auth/login - User authentication with LDAP
- POST /api/auth/logout - User logout and token invalidation
- POST /api/auth/refresh - JWT token refresh
- GET /api/auth/me - Current user information
- POST /api/auth/test-json - JSON parsing test endpoint
- POST /api/auth/test-json-object - Object parsing test endpoint

#### **Dashboard** (`DashboardController.java`)
- GET /api/dashboard/statistics - System-wide statistics
- GET /api/dashboard/users/statistics - User analytics and metrics
- GET /api/dashboard/tickets/statistics - Ticket metrics and trends
- GET /api/dashboard/equipment/status - Equipment monitoring data
- GET /api/dashboard/activity-summary - Activity log summary

#### **Users** (`UserController.java`)
- GET /api/users - List users with pagination & filters
- GET /api/users/{id} - Get user by ID
- GET /api/users/ldap/{ldapUsername} - Get user by LDAP username
- POST /api/users - Create new user (Admin only)
- PUT /api/users/{id} - Update user (Admin only)
- DELETE /api/users/{id} - Delete user (Admin only)
- GET /api/users/{id}/tickets - Get user's tickets
- GET /api/users/statistics - User statistics

**Query Parameters for User List:**
- `page`, `size` - Pagination
- `sortBy`, `sortDir` - Sorting (default: id, asc)
- `search` - Search by name, email, or username
- `department` - Filter by department
- `role` - Filter by user role (ADMIN, TECHNICIAN, EMPLOYEE)
- `isActive` - Filter by active status

#### **Tickets** (`TicketController.java`)
- GET /api/tickets - List tickets with pagination & filters
- GET /api/tickets/{id} - Get ticket by ID
- POST /api/tickets - Create new ticket
- PUT /api/tickets/{id} - Update ticket
- DELETE /api/tickets/{id} - Delete ticket (Admin only)
- PUT /api/tickets/{id}/assign - Assign ticket to technician
- PUT /api/tickets/{id}/status - Update ticket status
- GET /api/tickets/{id}/comments - Get ticket comments
- POST /api/tickets/{id}/comments - Add comment to ticket
- GET /api/tickets/statistics - Ticket statistics
- GET /api/tickets/my-tickets - Current user's tickets

**Query Parameters for Ticket List:**
- `page`, `size` - Pagination
- `sortBy`, `sortDir` - Sorting
- `search` - Search by title or description
- `status` - Filter by status (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
- `priority` - Filter by priority (CRITICAL, HIGH, MEDIUM, LOW)
- `category` - Filter by category
- `assignedTo` - Filter by assigned technician
- `createdBy` - Filter by ticket creator

#### **Equipment** (`EquipmentController.java`)
- GET /api/equipment - List equipment with pagination & filters
- GET /api/equipment/{id} - Get equipment by ID
- POST /api/equipment - Add new equipment (Admin only)
- PUT /api/equipment/{id} - Update equipment (Admin only)
- DELETE /api/equipment/{id} - Delete equipment (Admin only)
- GET /api/equipment/status - Equipment status summary
- GET /api/equipment/statistics - Equipment statistics
- POST /api/equipment/{id}/scan - Scan equipment via SNMP

**Query Parameters for Equipment List:**
- `page`, `size` - Pagination
- `sortBy`, `sortDir` - Sorting
- `search` - Search by name or description
- `equipmentType` - Filter by type (SERVER, NETWORK, PRINTER, etc.)
- `status` - Filter by status (ONLINE, OFFLINE, MAINTENANCE, RETIRED)
- `location` - Filter by physical location
- `isManaged` - Filter by SNMP management status

#### **Activity Logs** (`ActivityLogController.java`)
- GET /api/activity-logs - Paginated activity logs (Admin only)
- GET /api/activity-logs/statistics - Activity statistics (Admin only)
- GET /api/activity-logs/export - Export logs to CSV (Admin only)
- POST /api/activity-logs - Create log entry
- GET /api/activity-logs/recent - Recent activity summary

**Query Parameters for Activity Logs:**
- `userIdentifier` - Filter by user
- `action` - Filter by action type
- `severity` - Filter by severity (ERROR, WARNING, SUCCESS, INFO)
- `startDate`, `endDate` - Date range filter
- `searchTerm` - Search in log messages
- `page`, `size` - Pagination

#### **Network Discovery** (`NetworkDiscoveryController.java`)
- GET /api/network/discover - Discover network devices via SNMP
- GET /api/network/scan - Scan network range
- GET /api/network/devices - List discovered devices
- POST /api/network/scan - Start network scan
- GET /api/network/scan/{id}/status - Get scan status

#### **Health & Monitoring** (`HealthController.java`)
- GET /api/health - Basic health check
- GET /api/health/detailed - Detailed health status
- GET /api/health/database - Database health check
- GET /api/health/network - Network services health

#### **Database Management** (`DatabaseController.java`)
- GET /api/database/statistics - Database statistics (Admin only)
- GET /api/database/validate - Validate database schema (Admin only)
- POST /api/database/cleanup - Clean up old data (Admin only)
- POST /api/database/backup - Backup database (Admin only)

### **API Response Format**

All API responses follow a consistent format with data, message, timestamp, and status fields.

**Pagination Response:**
- Content array with paginated data
- Pageable object with page number, size, and sort information
- Total elements, pages, and pagination metadata

### **Authentication & Authorization**

- **JWT Tokens**: All endpoints (except login) require valid JWT token
- **Role-Based Access**: Endpoints protected with `@PreAuthorize` annotations
- **CORS Support**: Configured for multiple origins including production URLs
- **Token Expiration**: 24-hour token lifetime with refresh capability

### **Error Handling**

Standard HTTP status codes with detailed error messages including error type, message, timestamp, status code, and request path.

## 📈 **Features Implementation Status**

### **✅ Fully Implemented Features**

**Authentication & Security**
- [x] **LDAP Integration** - Government domain authentication
- [x] **JWT Token Management** - Secure session handling
- [x] **Role-Based Access Control** - Granular permissions
- [x] **Session Tracking** - User activity correlation
- [x] **Security Alerts** - Failed login detection

**Ticket Management**
- [x] **Complete Lifecycle** - Creation to resolution
- [x] **Priority System** - CRITICAL, HIGH, MEDIUM, LOW
- [x] **Status Tracking** - OPEN, IN_PROGRESS, RESOLVED, CLOSED
- [x] **Assignment System** - Technician assignment
- [x] **Comment System** - Ticket communication
- [x] **SLA Management** - Due dates and escalation
- [x] **Time Tracking** - Estimated vs actual hours
- [x] **Customer Satisfaction** - Rating system

**User Management**
- [x] **User Administration** - Full CRUD operations
- [x] **Role Management** - ADMIN, TECHNICIAN, EMPLOYEE
- [x] **Department Organization** - Government structure
- [x] **Profile Management** - Personal information updates
- [x] **Activity Tracking** - Login history and actions

**Equipment Monitoring**
- [x] **SNMP Integration** - Network device discovery
- [x] **Inventory Management** - Asset tracking
- [x] **Status Monitoring** - Real-time device status
- [x] **Location Tracking** - Physical and network location
- [x] **Maintenance Records** - Service history

**Dashboard & Analytics**
- [x] **Role-Specific Dashboards** - Admin, Technician, Employee
- [x] **Real-time Statistics** - Live data updates
- [x] **Performance Metrics** - Productivity analytics
- [x] **SLA Monitoring** - Compliance tracking
- [x] **Export Capabilities** - Report generation

**Activity Logging**
- [x] **Comprehensive Audit Trail** - All system activities
- [x] **Security Events** - Authentication and authorization
- [x] **User Actions** - Ticket and user operations
- [x] **System Changes** - Configuration modifications
- [x] **Export Functionality** - Compliance reporting

**UI/UX Features**
- [x] **Responsive Design** - Mobile, tablet, desktop
- [x] **Material-UI Integration** - Professional design
- [x] **DGH Branding** - Official logo and colors
- [x] **Bilingual Support** - French and Arabic
- [x] **Accessibility** - WCAG compliance

### **🔄 Planned Features**

**Advanced Features**
- [ ] **Email Notifications** - Automated ticket updates
- [ ] **File Attachments** - Ticket file upload system
- [ ] **Advanced Reporting** - Custom report generation
- [ ] **Mobile App** - Native mobile application
- [ ] **API Documentation** - Swagger/OpenAPI specs

**Integration Features**
- [ ] **SMS Notifications** - Text message alerts
- [ ] **Calendar Integration** - Schedule management
- [ ] **Third-party Integrations** - External system connections
- [ ] **Advanced Analytics** - Machine learning insights

## 🔒 **Security Architecture**

### **Multi-Layer Security Framework**

The DGH HelpDesk implements a comprehensive security architecture designed for government environments with multiple layers of protection.

#### **Authentication & Authorization**

**LDAP Integration** (`LdapConfig.java`)
- Configuration class with LDAP repository support
- Environment-based LDAP URL and base configuration
- LDAP username and password management

**JWT Token Management** (`JwtTokenProvider.java`)
- Component for JWT token operations
- Environment-based secret key and expiration configuration
- Token generation, validation, and refresh logic

**Role-Based Access Control** (`SecurityConfig.java`)
- Web security configuration with role-based access control
- Public endpoints for authentication and health checks
- Admin-only endpoints for database and activity logs
- Role-based access for users and equipment management
- Stateless session management with CSRF protection

#### **Security Features**

**1. LDAP Authentication**
- **Government Domain Integration**: Seamless Active Directory authentication
- **Single Sign-On (SSO)**: Centralized user management
- **Password Policy Enforcement**: LDAP server password policies
- **Account Lockout Protection**: Automatic account lockout on failed attempts

**2. JWT Token Security**
- **Stateless Authentication**: No server-side session storage
- **Token Expiration**: 24-hour token lifetime with refresh capability
- **Secure Token Generation**: HMAC-SHA256 algorithm
- **Token Blacklisting**: Logout token invalidation

**3. Role-Based Permissions**
- **ADMIN**: Full system access, user management, system configuration
- **TECHNICIAN**: Ticket resolution, equipment monitoring, user assistance
- **EMPLOYEE**: Ticket creation, status tracking, personal profile

#### **Audit & Compliance**

**Comprehensive Activity Logging** (`ActivityLog.java`)
- Entity for comprehensive activity logging with database table mapping
- User identifier, action, and severity tracking
- IP address, user agent, and session correlation
- Timestamp and detailed information storage

**Security Monitoring Features**
- **Real-time Activity Tracking**: All user actions logged with timestamps
- **IP Address Monitoring**: Track access patterns and locations
- **Session Correlation**: Link activities to user sessions
- **Failed Login Detection**: Automatic suspicious activity alerts
- **Export Capabilities**: Compliance reporting and audit trails
- **Admin Dashboard**: Real-time security monitoring interface

#### **Data Protection & Privacy**

**Input Validation & Sanitization**
- Entity validation with Bean Validation annotations
- Required field validation with custom error messages
- Size constraints and email format validation
- Comprehensive input sanitization for security

**SQL Injection Prevention**
- **JPA/Hibernate ORM**: Parameterized queries and prepared statements
- **Input Sanitization**: Server-side validation with Bean Validation
- **Database Security**: H2 database with restricted access
- **Query Optimization**: Safe query construction patterns

**Cross-Site Scripting (XSS) Protection**
- **Content Security Policy**: CSP headers for script execution control
- **Input Encoding**: HTML entity encoding for user input
- **Output Sanitization**: React's built-in XSS protection
- **CORS Configuration**: Controlled cross-origin resource sharing

#### **Network Security**

**CORS Configuration**
- Cross-origin resource sharing configuration
- Multiple allowed origins including localhost and production URLs
- Secure cross-origin request handling

**SNMP Security**
- **Community String Protection**: Secure SNMP community strings
- **Network Isolation**: Equipment monitoring on isolated networks
- **Access Control**: Role-based equipment access restrictions

#### **Container Security**

**Docker Security Best Practices**
- **Non-root User Execution**: Containers run as non-privileged users
- **Minimal Base Images**: Alpine Linux for reduced attack surface
- **Multi-stage Builds**: Separate build and runtime environments
- **Health Checks**: Container health monitoring and restart policies
- **Resource Limits**: Memory and CPU constraints for stability

#### **Government Compliance**

**Moroccan Government Standards**
- **Data Sovereignty**: Local data storage and processing
- **Audit Requirements**: Comprehensive activity logging
- **Access Controls**: Role-based permission system
- **Security Monitoring**: Real-time threat detection
- **Compliance Reporting**: Export capabilities for audit trails

**Security Configuration Examples**

**Production Security Settings**
- JWT Security: Environment-based secret key and expiration configuration
- LDAP Security: Server URL, base DN, and credential management
- Database Security: Username and password configuration
- SNMP Security: Community string, timeout, and retry settings

**Security Headers Configuration**
- Configuration class for security headers
- Filter registration for header management
- URL pattern configuration for security headers

## 📱 **Responsive Design Architecture**

### **Device Support**

**Desktop Interface**
- **Full-featured Interface** - Complete functionality
- **Multi-column Layout** - Efficient space utilization
- **Advanced Controls** - Keyboard shortcuts and shortcuts
- **Large Data Tables** - Comprehensive information display

**Tablet Interface**
- **Optimized Touch Interface** - Touch-friendly controls
- **Adaptive Layout** - Responsive grid system
- **Gesture Support** - Swipe and touch gestures
- **Medium Data Display** - Balanced information density

**Mobile Interface**
- **Mobile-first Design** - Progressive enhancement
- **Single-column Layout** - Vertical information flow
- **Touch-optimized Controls** - Large touch targets
- **Minimal Data Display** - Essential information only

### **Accessibility Features**

**WCAG Compliance**
- **Keyboard Navigation** - Full keyboard support
- **Screen Reader Support** - ARIA labels and descriptions
- **High Contrast** - Government accessibility requirements
- **Focus Management** - Clear focus indicators

**Government Standards**
- **Official Branding** - DGH logo and colors
- **Bilingual Support** - French and Arabic text
- **Security Standards** - Government security requirements
- **Audit Requirements** - Comprehensive logging system

## 🏛️ **Government Compliance**

### **Moroccan Government Standards**

**Official Branding**
- **DGH Logo Integration**: Official branding throughout
- **Government Colors**: Official blue theme (#1976d2)
- **Professional Typography**: Government-appropriate styling
- **Bilingual Support**: French and Arabic text

**Security Requirements**
- **LDAP Integration** - Government domain authentication
- **Role-Based Access** - Granular permission system
- **Audit Trails** - Complete activity logging
- **Data Sovereignty** - Local data storage compliance

**Compliance Features**
- **Activity Logging** - Comprehensive audit trail
- **Export Capabilities** - Compliance reporting
- **Security Monitoring** - Real-time threat detection
- **Access Controls** - Role-based permissions

## 🤝 **Contributing**

### **Development Guidelines**

**Code Standards**
- **Java 17** - Modern Java features and best practices
- **React 18** - Functional components and hooks
- **Material-UI** - Consistent design system
- **TypeScript** - Type safety and better development experience

**Testing Strategy**
- **Unit Tests** - JUnit for backend, Jest for frontend
- **Integration Tests** - API endpoint testing
- **Component Tests** - React component testing
- **Security Tests** - Authentication and authorization testing

**Documentation**
- **Code Documentation** - Comprehensive JavaDoc and JSDoc
- **API Documentation** - REST endpoint documentation
- **Architecture Documentation** - System design and patterns
- **User Documentation** - End-user guides and tutorials

### **Project Structure**

**Project Structure:**
- **Backend**: Spring Boot application with controllers, services, repositories, entities, configuration, security, and utilities
- **Frontend**: React application with components, features, services, contexts, hooks, utils, theme, and types
- **Data**: H2 database file and configuration
- **Documentation**: README and project documentation

## ❓ **Frequently Asked Questions (FAQ)**

### **General Questions**

**Q: What is the DGH HelpDesk system?**
A: The DGH HelpDesk is a comprehensive IT support management system designed specifically for the Moroccan Ministry of Equipment and Water. It provides ticket management, user administration, equipment monitoring, and comprehensive activity logging with government-grade security.

**Q: Who can use this system?**
A: The system is designed for three main user roles:
- **Administrators**: Full system access and management
- **Technicians**: IT support staff who resolve tickets and monitor equipment
- **Employees**: End users who create tickets and track their requests

**Q: Is this system suitable for other organizations?**
A: While designed for the Moroccan government, the system can be adapted for other organizations. The modular architecture and comprehensive documentation make it suitable for customization.

### **Technical Questions**

**Q: What are the system requirements?**
A: 
- **Backend**: Java 17+, Maven 3.6+, 2GB RAM minimum
- **Frontend**: Node.js 18+, 1GB RAM minimum
- **Database**: H2 (development) or PostgreSQL (production)
- **Browser**: Modern browsers with JavaScript enabled

**Q: How do I deploy this system?**
A: You have several options:
1. **Docker Compose** (Recommended for development)
2. **Local Development** (Java + Node.js)
3. **Azure Container Instances** (Production deployment)
4. **Manual deployment** on any server

**Q: Can I use a different database?**
A: Yes, the system uses Spring Data JPA which supports multiple databases. While H2 is used for development, you can configure PostgreSQL, MySQL, or other databases for production.

**Q: How does LDAP integration work?**
A: The system integrates with Active Directory/LDAP for authentication. Users authenticate against your organization's LDAP server, and the system synchronizes user information and roles.

### **Security Questions**

**Q: How secure is this system?**
A: The system implements multiple security layers:
- LDAP authentication with government domain integration
- JWT token-based authorization
- Role-based access control
- Comprehensive activity logging
- Input validation and SQL injection prevention
- XSS protection and CORS configuration

**Q: Can I audit user activities?**
A: Yes, the system provides comprehensive activity logging. Administrators can view, filter, and export activity logs for compliance and audit purposes.

**Q: How are passwords handled?**
A: The system uses LDAP authentication, so passwords are managed by your organization's Active Directory. The system never stores passwords locally.

### **Development Questions**

**Q: How do I contribute to this project?**
A: 
1. Fork the repository
2. Create a feature branch
3. Make your changes following the coding standards
4. Add tests for new functionality
5. Submit a pull request with a clear description

**Q: What coding standards are used?**
A: 
- **Backend**: Java 17 with Spring Boot best practices
- **Frontend**: React 18 with functional components and hooks
- **Code Style**: Follow existing patterns and use proper documentation
- **Testing**: Unit tests for critical functionality

**Q: How do I add new features?**
A: 
1. Design the feature following the existing architecture
2. Implement backend API endpoints with proper validation
3. Create frontend components with Material-UI
4. Add appropriate role-based access controls
5. Update documentation and tests

### **Troubleshooting**

**Q: The application won't start. What should I check?**
A: 
1. Verify Java 17+ is installed: `java -version`
2. Check if ports 8080 and 3000 are available
3. Ensure all dependencies are installed
4. Check application logs for specific error messages
5. Verify database connectivity

**Q: I can't log in. What's wrong?**
A: 
1. Check if LDAP server is accessible
2. Verify LDAP configuration in application.properties
3. Ensure user exists in LDAP directory
4. Check if user has proper role assignments
5. Try default credentials for development: admin/admin123

**Q: The frontend can't connect to the backend.**
A: 
1. Verify backend is running on port 8080
2. Check CORS configuration
3. Ensure REACT_APP_API_BASE_URL is set correctly
4. Check browser console for specific error messages
5. Verify network connectivity

**Q: Equipment discovery isn't working.**
A: 
1. Check SNMP configuration (community string, timeout)
2. Verify network connectivity to equipment
3. Ensure equipment supports SNMP
4. Check firewall settings
5. Review SNMP service logs

### **Performance Questions**

**Q: How many users can the system handle?**
A: The system is designed to handle hundreds of concurrent users. Performance depends on:
- Server specifications
- Database configuration
- Network infrastructure
- LDAP server performance

**Q: How do I optimize performance?**
A: 
1. Use production database (PostgreSQL) instead of H2
2. Configure proper JVM memory settings
3. Enable database connection pooling
4. Use CDN for static assets
5. Implement caching where appropriate

### **Integration Questions**

**Q: Can I integrate with other systems?**
A: Yes, the system provides REST APIs that can be integrated with:
- External ticketing systems
- Monitoring tools
- Reporting systems
- Third-party authentication providers

**Q: How do I backup the system?**
A: 
1. **Database**: Use the built-in backup endpoint or database tools
2. **Configuration**: Backup application.properties and environment variables
3. **Files**: Backup any uploaded files or custom configurations
4. **Docker**: Use volume backups for containerized deployments

## 📞 **Support & Contact**

### **Technical Support**

**Documentation**
- **API Reference** - Complete endpoint documentation above
- **User Guides** - Role-specific user manuals
- **Troubleshooting** - Common issues and solutions in FAQ
- **Security Updates** - Regular security patches

**Development Support**
- **Code Documentation** - Comprehensive inline documentation
- **Architecture Guides** - System design documentation above
- **Best Practices** - Development guidelines
- **Security Guidelines** - Security-focused development

### **Contact Information**

**Organization**: Direction Générale de l'Hydraulique  
**Ministry**: Ministry of Equipment and Water  
**Country**: Morocco  
**System**: DGH HelpDesk IT Support Management  
**Version**: 1.0.0  
**Last Updated**: January 2025

### **Getting Help**

1. **Check the FAQ** above for common questions
2. **Review the documentation** in this README
3. **Check application logs** for specific error messages
4. **Test with default credentials** for development issues
5. **Verify system requirements** and dependencies

---

**© 2025 Direction Générale de l'Hydraulique - Ministry of Equipment and Water, Morocco**

*Built with modern technologies for government IT support excellence, featuring comprehensive security, role-based access control, and government compliance standards.*

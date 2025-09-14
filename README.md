# DGH HelpDesk - IT Support Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://openjdk.java.net/)

**Direction Générale de l'Hydraulique** - Ministry of Equipment and Water, Morocco

A comprehensive IT helpdesk management system designed for government institutions, featuring role-based access control, ticket management, equipment monitoring, and comprehensive activity logging.

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- Maven 3.6+
- Docker 20+ (optional)

### Docker Development (Recommended)
```bash
# Clone and start
git clone <repository-url>
cd dgh-helpdesk-main
docker-compose up -d

# Access points
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
# H2 Console: http://localhost:8080/h2-console
```

### Local Development
```bash
# Backend
cd backend
mvn clean install
mvn spring-boot:run

# Frontend
cd frontend
npm install
npm start
```

### Default Login Credentials
| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| **Admin** | `admin` | `admin123` | Full system access |
| **Technician** | `tech` | `tech123` | Ticket resolution & equipment |
| **Employee** | `user` | `user123` | Ticket creation & tracking |

## 🏗️ Architecture

### Technology Stack
- **Backend**: Spring Boot 3.5.3, Java 17, H2 Database, LDAP Integration
- **Frontend**: React 18.2.0, Material-UI, Axios, Recharts
- **Security**: JWT Tokens, Role-based Access Control, Activity Logging
- **Monitoring**: SNMP4J for equipment discovery, Spring Actuator

### Key Features
- 🔐 **LDAP Authentication** - Government domain integration
- 👥 **Role-Based Access Control** - Admin, Technician, Employee roles
- 🎫 **Ticket Management** - Complete lifecycle management
- 📊 **Real-time Dashboards** - Role-specific analytics
- 🔍 **Activity Logging** - Comprehensive audit trail
- 🖥️ **Equipment Monitoring** - SNMP-based network discovery
- 📱 **Responsive Design** - Mobile, tablet, desktop support

## 📊 Role-Based System

### Admin Dashboard
- Global statistics and system metrics
- User administration and role management
- Equipment monitoring and activity logs
- Performance analytics and reporting

### Technician Dashboard
- Personal workload and SLA alerts
- Ticket resolution and time tracking
- Equipment access and knowledge base
- Performance metrics and compliance

### Employee Dashboard
- Personal ticket overview and creation
- Status tracking and communication
- Self-service knowledge base access
- Profile management

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Current user info

### Core Resources
- `GET /api/users` - User management (Admin)
- `GET /api/tickets` - Ticket management
- `GET /api/equipment` - Equipment monitoring
- `GET /api/activity-logs` - Activity logs (Admin)

### Dashboard
- `GET /api/dashboard/statistics` - System statistics
- `GET /api/dashboard/tickets/statistics` - Ticket metrics
- `GET /api/dashboard/equipment/status` - Equipment status

## 🔒 Security Features

- **LDAP Integration** - Government domain authentication
- **JWT Tokens** - Secure session management
- **Role-Based Access** - Granular permissions
- **Activity Logging** - Complete audit trail
- **Input Validation** - SQL injection and XSS protection
- **CORS Configuration** - Secure cross-origin requests

## 📱 Responsive Design

- **Desktop** - Full-featured interface with multi-column layout
- **Tablet** - Touch-optimized interface with adaptive layout
- **Mobile** - Mobile-first design with single-column layout
- **Accessibility** - WCAG compliance with keyboard navigation

## 🚀 Deployment

### Docker Compose
```bash
docker-compose up -d
```

### Azure Container Instances
The system includes automated CI/CD pipeline for Azure deployment:
- GitHub Actions workflow
- Azure Container Registry
- Automated container deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow coding standards (Java 17, React 18, Material-UI)
4. Add tests for new functionality
5. Submit a pull request

## 📞 Support

- **Documentation**: See this README and inline code documentation
- **Issues**: Check the FAQ section below
- **Security**: Report security issues privately

## ❓ FAQ

**Q: What are the system requirements?**
A: Java 17+, Node.js 18+, 2GB RAM minimum, modern browser

**Q: Can I use a different database?**
A: Yes, Spring Data JPA supports PostgreSQL, MySQL, and other databases

**Q: How does LDAP integration work?**
A: Users authenticate against your organization's LDAP server with synchronized roles

**Q: Is this system suitable for other organizations?**
A: Yes, the modular architecture can be adapted for other organizations

---

**© 2025 Direction Générale de l'Hydraulique - Ministry of Equipment and Water, Morocco**

*Built with modern technologies for government IT support excellence.*

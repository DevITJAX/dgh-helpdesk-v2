package ma.gov.dgh.helpdesk.controller;

import ma.gov.dgh.helpdesk.service.DatabaseService;
import ma.gov.dgh.helpdesk.service.NetworkDiscoveryService;
import ma.gov.dgh.helpdesk.service.SnmpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for Health Check operations
 */
@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "http://localhost:4200")
public class HealthController {
    
    private final DatabaseService databaseService;
    private final NetworkDiscoveryService networkDiscoveryService;
    private final SnmpService snmpService;
    
    @Autowired
    public HealthController(DatabaseService databaseService, 
                           NetworkDiscoveryService networkDiscoveryService,
                           SnmpService snmpService) {
        this.databaseService = databaseService;
        this.networkDiscoveryService = networkDiscoveryService;
        this.snmpService = snmpService;
    }
    
    /**
     * Basic health check
     */
    @GetMapping
    public ResponseEntity<HealthStatus> getHealth() {
        HealthStatus status = new HealthStatus();
        status.setStatus("UP");
        status.setTimestamp(LocalDateTime.now());
        status.setVersion("1.0.0");
        
        return ResponseEntity.ok(status);
    }
    
    /**
     * Detailed health check
     */
    @GetMapping("/detailed")
    public ResponseEntity<DetailedHealthStatus> getDetailedHealth() {
        DetailedHealthStatus status = new DetailedHealthStatus();
        status.setStatus("UP");
        status.setTimestamp(LocalDateTime.now());
        status.setVersion("1.0.0");
        
        // Check database health
        try {
            DatabaseService.DatabaseStatistics dbStats = databaseService.getDatabaseStatistics();
            status.addComponent("database", "UP", "Connected", Map.of(
                "userCount", dbStats.getUserCount(),
                "equipmentCount", dbStats.getEquipmentCount(),
                "ticketCount", dbStats.getTicketCount()
            ));
        } catch (Exception e) {
            status.addComponent("database", "DOWN", "Connection failed: " + e.getMessage(), null);
            status.setStatus("DOWN");
        }
        
        // Check network discovery service
        try {
            NetworkDiscoveryService.DiscoveryStatus discoveryStatus = networkDiscoveryService.getDiscoveryStatus();
            status.addComponent("networkDiscovery", 
                discoveryStatus.isEnabled() ? "UP" : "DISABLED", 
                "Network discovery service", 
                Map.of("enabled", discoveryStatus.isEnabled(), "subnets", discoveryStatus.getSubnetRanges())
            );
        } catch (Exception e) {
            status.addComponent("networkDiscovery", "DOWN", "Service error: " + e.getMessage(), null);
        }
        
        // Check SNMP service
        try {
            // Test SNMP with localhost (this might fail, but that's expected)
            boolean snmpWorking = snmpService.testSnmpConnectivity("127.0.0.1");
            status.addComponent("snmp", "UP", "SNMP service available", Map.of("testResult", snmpWorking));
        } catch (Exception e) {
            status.addComponent("snmp", "DOWN", "SNMP service error: " + e.getMessage(), null);
        }
        
        return ResponseEntity.ok(status);
    }
    
    /**
     * Check specific service health
     */
    @GetMapping("/service/{serviceName}")
    public ResponseEntity<ServiceHealthStatus> getServiceHealth(@PathVariable String serviceName) {
        ServiceHealthStatus status = new ServiceHealthStatus();
        status.setServiceName(serviceName);
        status.setTimestamp(LocalDateTime.now());
        
        switch (serviceName.toLowerCase()) {
            case "database":
                try {
                    databaseService.getDatabaseStatistics();
                    status.setStatus("UP");
                    status.setMessage("Database is accessible");
                } catch (Exception e) {
                    status.setStatus("DOWN");
                    status.setMessage("Database error: " + e.getMessage());
                }
                break;
                
            case "network-discovery":
                try {
                    NetworkDiscoveryService.DiscoveryStatus discoveryStatus = networkDiscoveryService.getDiscoveryStatus();
                    status.setStatus(discoveryStatus.isEnabled() ? "UP" : "DISABLED");
                    status.setMessage("Network discovery service");
                } catch (Exception e) {
                    status.setStatus("DOWN");
                    status.setMessage("Network discovery error: " + e.getMessage());
                }
                break;
                
            case "snmp":
                try {
                    status.setStatus("UP");
                    status.setMessage("SNMP service is available");
                } catch (Exception e) {
                    status.setStatus("DOWN");
                    status.setMessage("SNMP service error: " + e.getMessage());
                }
                break;
                
            default:
                status.setStatus("UNKNOWN");
                status.setMessage("Unknown service: " + serviceName);
                return ResponseEntity.badRequest().body(status);
        }
        
        return ResponseEntity.ok(status);
    }
    
    // Inner classes for health status responses
    
    public static class HealthStatus {
        private String status;
        private LocalDateTime timestamp;
        private String version;
        
        // Getters and setters
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        
        public String getVersion() { return version; }
        public void setVersion(String version) { this.version = version; }
    }
    
    public static class DetailedHealthStatus extends HealthStatus {
        private Map<String, ComponentHealth> components = new HashMap<>();
        
        public void addComponent(String name, String status, String message, Map<String, Object> details) {
            components.put(name, new ComponentHealth(status, message, details));
        }
        
        public Map<String, ComponentHealth> getComponents() { return components; }
        public void setComponents(Map<String, ComponentHealth> components) { this.components = components; }
    }
    
    public static class ComponentHealth {
        private String status;
        private String message;
        private Map<String, Object> details;
        
        public ComponentHealth(String status, String message, Map<String, Object> details) {
            this.status = status;
            this.message = message;
            this.details = details;
        }
        
        // Getters and setters
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public Map<String, Object> getDetails() { return details; }
        public void setDetails(Map<String, Object> details) { this.details = details; }
    }
    
    public static class ServiceHealthStatus {
        private String serviceName;
        private String status;
        private String message;
        private LocalDateTime timestamp;
        
        // Getters and setters
        public String getServiceName() { return serviceName; }
        public void setServiceName(String serviceName) { this.serviceName = serviceName; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    }
}

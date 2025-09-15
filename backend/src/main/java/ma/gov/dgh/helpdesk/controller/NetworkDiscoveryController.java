package ma.gov.dgh.helpdesk.controller;

import ma.gov.dgh.helpdesk.entity.Equipment;
import ma.gov.dgh.helpdesk.service.NetworkDiscoveryService;
import ma.gov.dgh.helpdesk.service.SnmpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * REST Controller for Network Discovery operations
 */
@RestController
@RequestMapping("/api/network-discovery")
@CrossOrigin(origins = {"http://localhost:4200", "http://dgh-helpdesk-frontend-westus2.westus2.azurecontainer.io"})
public class NetworkDiscoveryController {
    
    private final NetworkDiscoveryService networkDiscoveryService;
    private final SnmpService snmpService;
    
    @Autowired
    public NetworkDiscoveryController(NetworkDiscoveryService networkDiscoveryService, SnmpService snmpService) {
        this.networkDiscoveryService = networkDiscoveryService;
        this.snmpService = snmpService;
    }
    
    /**
     * Start network discovery scan
     */
    @PostMapping("/scan")
    @PreAuthorize("hasRole('TECHNICIAN') or hasRole('ADMIN')")
    public ResponseEntity<DiscoveryResponse> startNetworkScan() {
        try {
            CompletableFuture<List<Equipment>> future = networkDiscoveryService.performNetworkDiscovery();
            return ResponseEntity.ok(new DiscoveryResponse("Network discovery started", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new DiscoveryResponse("Failed to start network discovery: " + e.getMessage(), false));
        }
    }
    
    /**
     * Scan a specific device by IP address
     */
    @PostMapping("/scan/{ipAddress}")
    @PreAuthorize("hasRole('TECHNICIAN') or hasRole('ADMIN')")
    public ResponseEntity<Equipment> scanSingleDevice(@PathVariable String ipAddress) {
        try {
            CompletableFuture<Equipment> future = networkDiscoveryService.scanSingleDevice(ipAddress);
            Equipment equipment = future.get(); // Wait for completion
            
            if (equipment != null) {
                return ResponseEntity.ok(equipment);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Test SNMP connectivity to a device
     */
    @GetMapping("/test-snmp/{ipAddress}")
    @PreAuthorize("hasRole('TECHNICIAN') or hasRole('ADMIN')")
    public ResponseEntity<SnmpTestResponse> testSnmpConnectivity(@PathVariable String ipAddress) {
        boolean isReachable = snmpService.testSnmpConnectivity(ipAddress);
        return ResponseEntity.ok(new SnmpTestResponse(ipAddress, isReachable));
    }
    
    /**
     * Get discovery status
     */
    @GetMapping("/status")
    @PreAuthorize("hasRole('TECHNICIAN') or hasRole('ADMIN')")
    public ResponseEntity<NetworkDiscoveryService.DiscoveryStatus> getDiscoveryStatus() {
        NetworkDiscoveryService.DiscoveryStatus status = networkDiscoveryService.getDiscoveryStatus();
        return ResponseEntity.ok(status);
    }
    
    // Inner classes for response DTOs
    
    public static class DiscoveryResponse {
        private String message;
        private boolean success;
        
        public DiscoveryResponse(String message, boolean success) {
            this.message = message;
            this.success = success;
        }
        
        public String getMessage() {
            return message;
        }
        
        public boolean isSuccess() {
            return success;
        }
    }
    
    public static class SnmpTestResponse {
        private String ipAddress;
        private boolean reachable;
        
        public SnmpTestResponse(String ipAddress, boolean reachable) {
            this.ipAddress = ipAddress;
            this.reachable = reachable;
        }
        
        public String getIpAddress() {
            return ipAddress;
        }
        
        public boolean isReachable() {
            return reachable;
        }
    }
}

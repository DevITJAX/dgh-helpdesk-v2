package ma.gov.dgh.helpdesk.controller;

import ma.gov.dgh.helpdesk.entity.Equipment;
import ma.gov.dgh.helpdesk.entity.EquipmentStatus;
import ma.gov.dgh.helpdesk.entity.EquipmentType;
import ma.gov.dgh.helpdesk.service.EquipmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

/**
 * REST Controller for Equipment operations
 */
@RestController
@RequestMapping("/api/equipment")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:4200", "http://dgh-helpdesk-frontend-westus2.westus2.azurecontainer.io"})
public class EquipmentController {
    
    private final EquipmentService equipmentService;
    
    @Autowired
    public EquipmentController(EquipmentService equipmentService) {
        this.equipmentService = equipmentService;
    }
    
    /**
     * Get all equipment with pagination and filtering
     */
    @GetMapping
    public ResponseEntity<Page<Equipment>> getAllEquipment(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) EquipmentType equipmentType,
            @RequestParam(required = false) EquipmentStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Boolean isManaged) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Equipment> equipment = equipmentService.findEquipmentWithFilters(
            search, equipmentType, status, location, isManaged, pageable);
        return ResponseEntity.ok(equipment);
    }
    
    /**
     * Get equipment by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Equipment> getEquipmentById(@PathVariable Long id) {
        Optional<Equipment> equipment = equipmentService.findById(id);
        return equipment.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get equipment by IP address
     */
    @GetMapping("/ip/{ipAddress}")
    public ResponseEntity<Equipment> getEquipmentByIpAddress(@PathVariable String ipAddress) {
        Optional<Equipment> equipment = equipmentService.findByIpAddress(ipAddress);
        return equipment.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get equipment by MAC address
     */
    @GetMapping("/mac/{macAddress}")
    public ResponseEntity<Equipment> getEquipmentByMacAddress(@PathVariable String macAddress) {
        Optional<Equipment> equipment = equipmentService.findByMacAddress(macAddress);
        return equipment.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get equipment by hostname
     */
    @GetMapping("/hostname/{hostname}")
    public ResponseEntity<Equipment> getEquipmentByHostname(@PathVariable String hostname) {
        Optional<Equipment> equipment = equipmentService.findByHostname(hostname);
        return equipment.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get equipment by type
     */
    @GetMapping("/type/{equipmentType}")
    public ResponseEntity<List<Equipment>> getEquipmentByType(@PathVariable EquipmentType equipmentType) {
        List<Equipment> equipment = equipmentService.findByType(equipmentType);
        return ResponseEntity.ok(equipment);
    }
    
    /**
     * Get equipment by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Equipment>> getEquipmentByStatus(@PathVariable EquipmentStatus status) {
        List<Equipment> equipment = equipmentService.findByStatus(status);
        return ResponseEntity.ok(equipment);
    }
    
    /**
     * Get equipment by location
     */
    @GetMapping("/location/{location}")
    public ResponseEntity<List<Equipment>> getEquipmentByLocation(@PathVariable String location) {
        List<Equipment> equipment = equipmentService.findByLocation(location);
        return ResponseEntity.ok(equipment);
    }
    
    /**
     * Get managed equipment
     */
    @GetMapping("/managed")
    public ResponseEntity<List<Equipment>> getManagedEquipment() {
        List<Equipment> equipment = equipmentService.findManagedEquipment();
        return ResponseEntity.ok(equipment);
    }
    
    /**
     * Get unmanaged equipment
     */
    @GetMapping("/unmanaged")
    public ResponseEntity<List<Equipment>> getUnmanagedEquipment() {
        List<Equipment> equipment = equipmentService.findUnmanagedEquipment();
        return ResponseEntity.ok(equipment);
    }
    
    /**
     * Get equipment not seen for specified hours
     */
    @GetMapping("/not-seen")
    public ResponseEntity<List<Equipment>> getEquipmentNotSeen(@RequestParam(defaultValue = "24") int hours) {
        List<Equipment> equipment = equipmentService.findEquipmentNotSeenSince(hours);
        return ResponseEntity.ok(equipment);
    }
    
    /**
     * Get equipment with expiring warranty
     */
    @GetMapping("/warranty-expiring")
    public ResponseEntity<List<Equipment>> getEquipmentWithExpiringWarranty(
            @RequestParam(defaultValue = "30") int daysFromNow) {
        List<Equipment> equipment = equipmentService.findEquipmentWithExpiringWarranty(daysFromNow);
        return ResponseEntity.ok(equipment);
    }
    
    /**
     * Get distinct locations
     */
    @GetMapping("/locations")
    public ResponseEntity<List<String>> getDistinctLocations() {
        List<String> locations = equipmentService.getDistinctLocations();
        return ResponseEntity.ok(locations);
    }
    
    /**
     * Get distinct manufacturers
     */
    @GetMapping("/manufacturers")
    public ResponseEntity<List<String>> getDistinctManufacturers() {
        List<String> manufacturers = equipmentService.getDistinctManufacturers();
        return ResponseEntity.ok(manufacturers);
    }
    
    /**
     * Create new equipment
     */
    @PostMapping
    public ResponseEntity<Equipment> createEquipment(@Valid @RequestBody Equipment equipment) {
        try {
            Equipment createdEquipment = equipmentService.createEquipment(equipment);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdEquipment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Update existing equipment
     */
    @PutMapping("/{id}")
    public ResponseEntity<Equipment> updateEquipment(@PathVariable Long id, @Valid @RequestBody Equipment equipment) {
        try {
            equipment.setId(id);
            Equipment updatedEquipment = equipmentService.updateEquipment(equipment);
            return ResponseEntity.ok(updatedEquipment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Update equipment status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Equipment> updateEquipmentStatus(@PathVariable Long id, 
                                                          @RequestBody StatusUpdateRequest request) {
        try {
            Equipment equipment = equipmentService.updateStatus(id, request.getStatus());
            return ResponseEntity.ok(equipment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Update equipment last seen time
     */
    @PutMapping("/{id}/last-seen")
    public ResponseEntity<Equipment> updateLastSeen(@PathVariable Long id) {
        try {
            Equipment equipment = equipmentService.updateLastSeen(id);
            return ResponseEntity.ok(equipment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Update equipment last seen time by IP address
     */
    @PutMapping("/ip/{ipAddress}/last-seen")
    public ResponseEntity<Equipment> updateLastSeenByIp(@PathVariable String ipAddress) {
        try {
            Equipment equipment = equipmentService.updateLastSeenByIp(ipAddress);
            return ResponseEntity.ok(equipment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Mark equipment as managed
     */
    @PutMapping("/{id}/manage")
    public ResponseEntity<Equipment> markAsManaged(@PathVariable Long id) {
        try {
            Equipment equipment = equipmentService.markAsManaged(id);
            return ResponseEntity.ok(equipment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Mark equipment as unmanaged
     */
    @PutMapping("/{id}/unmanage")
    public ResponseEntity<Equipment> markAsUnmanaged(@PathVariable Long id) {
        try {
            Equipment equipment = equipmentService.markAsUnmanaged(id);
            return ResponseEntity.ok(equipment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Delete equipment
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEquipment(@PathVariable Long id) {
        try {
            equipmentService.deleteEquipment(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get equipment statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<EquipmentService.EquipmentStatistics> getEquipmentStatistics() {
        EquipmentService.EquipmentStatistics statistics = equipmentService.getEquipmentStatistics();
        return ResponseEntity.ok(statistics);
    }
    
    /**
     * Create or update equipment from network discovery
     */
    @PostMapping("/discovery")
    public ResponseEntity<Equipment> createOrUpdateFromDiscovery(@RequestBody DiscoveryRequest request) {
        try {
            Equipment equipment = equipmentService.createOrUpdateFromDiscovery(
                request.getIpAddress(),
                request.getMacAddress(),
                request.getHostname(),
                request.getEquipmentType(),
                request.getManufacturer(),
                request.getModel()
            );
            return ResponseEntity.ok(equipment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Inner classes for request DTOs
    
    public static class StatusUpdateRequest {
        private EquipmentStatus status;
        
        public EquipmentStatus getStatus() {
            return status;
        }
        
        public void setStatus(EquipmentStatus status) {
            this.status = status;
        }
    }
    
    public static class DiscoveryRequest {
        private String ipAddress;
        private String macAddress;
        private String hostname;
        private EquipmentType equipmentType;
        private String manufacturer;
        private String model;
        
        // Getters and setters
        public String getIpAddress() {
            return ipAddress;
        }
        
        public void setIpAddress(String ipAddress) {
            this.ipAddress = ipAddress;
        }
        
        public String getMacAddress() {
            return macAddress;
        }
        
        public void setMacAddress(String macAddress) {
            this.macAddress = macAddress;
        }
        
        public String getHostname() {
            return hostname;
        }
        
        public void setHostname(String hostname) {
            this.hostname = hostname;
        }
        
        public EquipmentType getEquipmentType() {
            return equipmentType;
        }
        
        public void setEquipmentType(EquipmentType equipmentType) {
            this.equipmentType = equipmentType;
        }
        
        public String getManufacturer() {
            return manufacturer;
        }
        
        public void setManufacturer(String manufacturer) {
            this.manufacturer = manufacturer;
        }
        
        public String getModel() {
            return model;
        }
        
        public void setModel(String model) {
            this.model = model;
        }
    }
}

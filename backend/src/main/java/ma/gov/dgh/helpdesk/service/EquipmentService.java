package ma.gov.dgh.helpdesk.service;

import ma.gov.dgh.helpdesk.entity.Equipment;
import ma.gov.dgh.helpdesk.entity.EquipmentStatus;
import ma.gov.dgh.helpdesk.entity.EquipmentType;
import ma.gov.dgh.helpdesk.repository.EquipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for Equipment entity operations
 */
@Service
@Transactional
public class EquipmentService {
    
    private final EquipmentRepository equipmentRepository;
    
    @Autowired
    public EquipmentService(EquipmentRepository equipmentRepository) {
        this.equipmentRepository = equipmentRepository;
    }
    
    /**
     * Create new equipment
     */
    public Equipment createEquipment(Equipment equipment) {
        // Check for duplicate IP address
        if (equipment.getIpAddress() != null && equipmentRepository.existsByIpAddress(equipment.getIpAddress())) {
            throw new IllegalArgumentException("Equipment with IP address already exists: " + equipment.getIpAddress());
        }
        
        // Check for duplicate MAC address
        if (equipment.getMacAddress() != null && equipmentRepository.existsByMacAddress(equipment.getMacAddress())) {
            throw new IllegalArgumentException("Equipment with MAC address already exists: " + equipment.getMacAddress());
        }
        
        // Check for duplicate hostname
        if (equipment.getHostname() != null && equipmentRepository.existsByHostname(equipment.getHostname())) {
            throw new IllegalArgumentException("Equipment with hostname already exists: " + equipment.getHostname());
        }
        
        equipment.setLastSeen(LocalDateTime.now());
        return equipmentRepository.save(equipment);
    }
    
    /**
     * Update existing equipment
     */
    public Equipment updateEquipment(Equipment equipment) {
        if (equipment.getId() == null) {
            throw new IllegalArgumentException("Equipment ID cannot be null for update operation");
        }
        
        Optional<Equipment> existingEquipment = equipmentRepository.findById(equipment.getId());
        if (existingEquipment.isEmpty()) {
            throw new IllegalArgumentException("Equipment not found with ID: " + equipment.getId());
        }
        
        // Check for duplicate IP address (excluding current equipment)
        if (equipment.getIpAddress() != null) {
            Optional<Equipment> equipmentWithSameIp = equipmentRepository.findByIpAddress(equipment.getIpAddress());
            if (equipmentWithSameIp.isPresent() && !equipmentWithSameIp.get().getId().equals(equipment.getId())) {
                throw new IllegalArgumentException("Another equipment with IP address already exists: " + equipment.getIpAddress());
            }
        }
        
        // Check for duplicate MAC address (excluding current equipment)
        if (equipment.getMacAddress() != null) {
            Optional<Equipment> equipmentWithSameMac = equipmentRepository.findByMacAddress(equipment.getMacAddress());
            if (equipmentWithSameMac.isPresent() && !equipmentWithSameMac.get().getId().equals(equipment.getId())) {
                throw new IllegalArgumentException("Another equipment with MAC address already exists: " + equipment.getMacAddress());
            }
        }
        
        // Check for duplicate hostname (excluding current equipment)
        if (equipment.getHostname() != null) {
            Optional<Equipment> equipmentWithSameHostname = equipmentRepository.findByHostname(equipment.getHostname());
            if (equipmentWithSameHostname.isPresent() && !equipmentWithSameHostname.get().getId().equals(equipment.getId())) {
                throw new IllegalArgumentException("Another equipment with hostname already exists: " + equipment.getHostname());
            }
        }
        
        return equipmentRepository.save(equipment);
    }
    
    /**
     * Find equipment by ID
     */
    @Transactional(readOnly = true)
    public Optional<Equipment> findById(Long id) {
        return equipmentRepository.findById(id);
    }
    
    /**
     * Find equipment by IP address
     */
    @Transactional(readOnly = true)
    public Optional<Equipment> findByIpAddress(String ipAddress) {
        return equipmentRepository.findByIpAddress(ipAddress);
    }
    
    /**
     * Find equipment by MAC address
     */
    @Transactional(readOnly = true)
    public Optional<Equipment> findByMacAddress(String macAddress) {
        return equipmentRepository.findByMacAddress(macAddress);
    }
    
    /**
     * Find equipment by hostname
     */
    @Transactional(readOnly = true)
    public Optional<Equipment> findByHostname(String hostname) {
        return equipmentRepository.findByHostname(hostname);
    }
    
    /**
     * Get all equipment
     */
    @Transactional(readOnly = true)
    public List<Equipment> findAll() {
        return equipmentRepository.findAll();
    }
    
    /**
     * Get equipment by type
     */
    @Transactional(readOnly = true)
    public List<Equipment> findByType(EquipmentType equipmentType) {
        return equipmentRepository.findByEquipmentType(equipmentType);
    }
    
    /**
     * Get equipment by status
     */
    @Transactional(readOnly = true)
    public List<Equipment> findByStatus(EquipmentStatus status) {
        return equipmentRepository.findByStatus(status);
    }
    
    /**
     * Get equipment by location
     */
    @Transactional(readOnly = true)
    public List<Equipment> findByLocation(String location) {
        return equipmentRepository.findByLocation(location);
    }
    
    /**
     * Get managed equipment
     */
    @Transactional(readOnly = true)
    public List<Equipment> findManagedEquipment() {
        return equipmentRepository.findByIsManagedTrue();
    }
    
    /**
     * Get unmanaged equipment
     */
    @Transactional(readOnly = true)
    public List<Equipment> findUnmanagedEquipment() {
        return equipmentRepository.findByIsManagedFalse();
    }
    
    /**
     * Get equipment with filters and pagination
     */
    @Transactional(readOnly = true)
    public Page<Equipment> findEquipmentWithFilters(String search, EquipmentType equipmentType, 
                                                   EquipmentStatus status, String location, 
                                                   Boolean isManaged, Pageable pageable) {
        return equipmentRepository.findEquipmentWithFilters(search, equipmentType, status, location, isManaged, pageable);
    }
    
    /**
     * Update equipment status
     */
    public Equipment updateStatus(Long equipmentId, EquipmentStatus status) {
        Optional<Equipment> equipmentOpt = equipmentRepository.findById(equipmentId);
        if (equipmentOpt.isEmpty()) {
            throw new IllegalArgumentException("Equipment not found with ID: " + equipmentId);
        }
        
        Equipment equipment = equipmentOpt.get();
        equipment.setStatus(status);
        equipment.setLastSeen(LocalDateTime.now());
        return equipmentRepository.save(equipment);
    }
    
    /**
     * Update equipment last seen time
     */
    public Equipment updateLastSeen(Long equipmentId) {
        Optional<Equipment> equipmentOpt = equipmentRepository.findById(equipmentId);
        if (equipmentOpt.isEmpty()) {
            throw new IllegalArgumentException("Equipment not found with ID: " + equipmentId);
        }
        
        Equipment equipment = equipmentOpt.get();
        equipment.setLastSeen(LocalDateTime.now());
        equipment.setStatus(EquipmentStatus.ONLINE);
        return equipmentRepository.save(equipment);
    }
    
    /**
     * Update equipment last seen time by IP address
     */
    public Equipment updateLastSeenByIp(String ipAddress) {
        Optional<Equipment> equipmentOpt = equipmentRepository.findByIpAddress(ipAddress);
        if (equipmentOpt.isEmpty()) {
            throw new IllegalArgumentException("Equipment not found with IP address: " + ipAddress);
        }
        
        Equipment equipment = equipmentOpt.get();
        equipment.setLastSeen(LocalDateTime.now());
        equipment.setStatus(EquipmentStatus.ONLINE);
        return equipmentRepository.save(equipment);
    }
    
    /**
     * Mark equipment as managed
     */
    public Equipment markAsManaged(Long equipmentId) {
        Optional<Equipment> equipmentOpt = equipmentRepository.findById(equipmentId);
        if (equipmentOpt.isEmpty()) {
            throw new IllegalArgumentException("Equipment not found with ID: " + equipmentId);
        }
        
        Equipment equipment = equipmentOpt.get();
        equipment.setIsManaged(true);
        return equipmentRepository.save(equipment);
    }
    
    /**
     * Mark equipment as unmanaged
     */
    public Equipment markAsUnmanaged(Long equipmentId) {
        Optional<Equipment> equipmentOpt = equipmentRepository.findById(equipmentId);
        if (equipmentOpt.isEmpty()) {
            throw new IllegalArgumentException("Equipment not found with ID: " + equipmentId);
        }
        
        Equipment equipment = equipmentOpt.get();
        equipment.setIsManaged(false);
        return equipmentRepository.save(equipment);
    }
    
    /**
     * Delete equipment
     */
    public void deleteEquipment(Long equipmentId) {
        if (!equipmentRepository.existsById(equipmentId)) {
            throw new IllegalArgumentException("Equipment not found with ID: " + equipmentId);
        }
        equipmentRepository.deleteById(equipmentId);
    }
    
    /**
     * Find equipment not seen for specified hours
     */
    @Transactional(readOnly = true)
    public List<Equipment> findEquipmentNotSeenSince(int hours) {
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(hours);
        return equipmentRepository.findEquipmentNotSeenSince(cutoffTime);
    }
    
    /**
     * Find equipment with warranty expiring soon
     */
    @Transactional(readOnly = true)
    public List<Equipment> findEquipmentWithExpiringWarranty(int daysFromNow) {
        LocalDateTime startDate = LocalDateTime.now();
        LocalDateTime endDate = LocalDateTime.now().plusDays(daysFromNow);
        return equipmentRepository.findByWarrantyExpiryBetween(startDate, endDate);
    }
    
    /**
     * Get distinct locations
     */
    @Transactional(readOnly = true)
    public List<String> getDistinctLocations() {
        return equipmentRepository.findDistinctLocations();
    }
    
    /**
     * Get distinct manufacturers
     */
    @Transactional(readOnly = true)
    public List<String> getDistinctManufacturers() {
        return equipmentRepository.findDistinctManufacturers();
    }
    
    /**
     * Get equipment statistics
     */
    @Transactional(readOnly = true)
    public EquipmentStatistics getEquipmentStatistics() {
        long totalEquipment = equipmentRepository.count();
        long onlineEquipment = equipmentRepository.countByStatus(EquipmentStatus.ONLINE);
        long offlineEquipment = equipmentRepository.countByStatus(EquipmentStatus.OFFLINE);
        long managedEquipment = equipmentRepository.countByIsManagedTrue();
        
        return new EquipmentStatistics(totalEquipment, onlineEquipment, offlineEquipment, managedEquipment);
    }
    
    /**
     * Create or update equipment from network discovery
     */
    public Equipment createOrUpdateFromDiscovery(String ipAddress, String macAddress, String hostname, 
                                               EquipmentType type, String manufacturer, String model) {
        Optional<Equipment> existingEquipment = equipmentRepository.findByIpAddress(ipAddress);
        
        if (existingEquipment.isPresent()) {
            // Update existing equipment
            Equipment equipment = existingEquipment.get();
            equipment.setMacAddress(macAddress);
            equipment.setHostname(hostname);
            equipment.setEquipmentType(type);
            equipment.setManufacturer(manufacturer);
            equipment.setModel(model);
            equipment.setLastSeen(LocalDateTime.now());
            equipment.setStatus(EquipmentStatus.ONLINE);
            return equipmentRepository.save(equipment);
        } else {
            // Create new equipment
            Equipment newEquipment = new Equipment(ipAddress, type);
            newEquipment.setMacAddress(macAddress);
            newEquipment.setHostname(hostname);
            newEquipment.setManufacturer(manufacturer);
            newEquipment.setModel(model);
            newEquipment.setLastSeen(LocalDateTime.now());
            newEquipment.setStatus(EquipmentStatus.ONLINE);
            return equipmentRepository.save(newEquipment);
        }
    }
    
    /**
     * Inner class for equipment statistics
     */
    public static class EquipmentStatistics {
        private final long totalEquipment;
        private final long onlineEquipment;
        private final long offlineEquipment;
        private final long managedEquipment;
        
        public EquipmentStatistics(long totalEquipment, long onlineEquipment, 
                                 long offlineEquipment, long managedEquipment) {
            this.totalEquipment = totalEquipment;
            this.onlineEquipment = onlineEquipment;
            this.offlineEquipment = offlineEquipment;
            this.managedEquipment = managedEquipment;
        }
        
        // Getters
        public long getTotalEquipment() { return totalEquipment; }
        public long getOnlineEquipment() { return onlineEquipment; }
        public long getOfflineEquipment() { return offlineEquipment; }
        public long getManagedEquipment() { return managedEquipment; }
    }
}

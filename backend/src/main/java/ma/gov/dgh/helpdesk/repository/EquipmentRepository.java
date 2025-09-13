package ma.gov.dgh.helpdesk.repository;

import ma.gov.dgh.helpdesk.entity.Equipment;
import ma.gov.dgh.helpdesk.entity.EquipmentStatus;
import ma.gov.dgh.helpdesk.entity.EquipmentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Equipment entity operations
 */
@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    
    /**
     * Find equipment by IP address
     */
    Optional<Equipment> findByIpAddress(String ipAddress);
    
    /**
     * Find equipment by MAC address
     */
    Optional<Equipment> findByMacAddress(String macAddress);
    
    /**
     * Find equipment by hostname
     */
    Optional<Equipment> findByHostname(String hostname);
    
    /**
     * Find equipment by asset tag
     */
    Optional<Equipment> findByAssetTag(String assetTag);
    
    /**
     * Find equipment by type
     */
    List<Equipment> findByEquipmentType(EquipmentType equipmentType);
    
    /**
     * Find equipment by status
     */
    List<Equipment> findByStatus(EquipmentStatus status);
    
    /**
     * Find equipment by location
     */
    List<Equipment> findByLocation(String location);
    
    /**
     * Find equipment by manufacturer
     */
    List<Equipment> findByManufacturer(String manufacturer);
    
    /**
     * Find equipment by manufacturer and model
     */
    List<Equipment> findByManufacturerAndModel(String manufacturer, String model);
    
    /**
     * Find managed equipment
     */
    List<Equipment> findByIsManagedTrue();
    
    /**
     * Find unmanaged equipment
     */
    List<Equipment> findByIsManagedFalse();
    
    /**
     * Find online equipment
     */
    @Query("SELECT e FROM Equipment e WHERE e.status = 'ONLINE'")
    List<Equipment> findOnlineEquipment();
    
    /**
     * Find equipment last seen after a specific date
     */
    List<Equipment> findByLastSeenAfter(LocalDateTime date);
    
    /**
     * Find equipment last seen before a specific date (potentially offline)
     */
    List<Equipment> findByLastSeenBefore(LocalDateTime date);
    
    /**
     * Find equipment with warranty expiring soon
     */
    List<Equipment> findByWarrantyExpiryBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Find equipment purchased in a date range
     */
    List<Equipment> findByPurchaseDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Check if IP address exists
     */
    boolean existsByIpAddress(String ipAddress);
    
    /**
     * Check if MAC address exists
     */
    boolean existsByMacAddress(String macAddress);
    
    /**
     * Check if hostname exists
     */
    boolean existsByHostname(String hostname);
    
    /**
     * Find equipment with pagination and search
     */
    @Query("SELECT e FROM Equipment e WHERE " +
           "(:search IS NULL OR LOWER(e.hostname) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.ipAddress) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.manufacturer) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.model) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.location) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:equipmentType IS NULL OR e.equipmentType = :equipmentType) AND " +
           "(:status IS NULL OR e.status = :status) AND " +
           "(:location IS NULL OR e.location = :location) AND " +
           "(:isManaged IS NULL OR e.isManaged = :isManaged)")
    Page<Equipment> findEquipmentWithFilters(@Param("search") String search,
                                           @Param("equipmentType") EquipmentType equipmentType,
                                           @Param("status") EquipmentStatus status,
                                           @Param("location") String location,
                                           @Param("isManaged") Boolean isManaged,
                                           Pageable pageable);
    
    /**
     * Count equipment by type
     */
    long countByEquipmentType(EquipmentType equipmentType);
    
    /**
     * Count equipment by status
     */
    long countByStatus(EquipmentStatus status);
    
    /**
     * Count equipment by location
     */
    long countByLocation(String location);
    
    /**
     * Count managed equipment
     */
    long countByIsManagedTrue();
    
    /**
     * Find equipment in IP range
     */
    @Query("SELECT e FROM Equipment e WHERE e.ipAddress LIKE :ipPattern")
    List<Equipment> findByIpAddressPattern(@Param("ipPattern") String ipPattern);
    
    /**
     * Find equipment with most tickets
     */
    @Query("SELECT e FROM Equipment e LEFT JOIN e.tickets t GROUP BY e ORDER BY COUNT(t) DESC")
    List<Equipment> findEquipmentOrderByTicketCount(Pageable pageable);
    
    /**
     * Find equipment not seen for specified hours
     */
    @Query("SELECT e FROM Equipment e WHERE e.lastSeen < :cutoffTime OR e.lastSeen IS NULL")
    List<Equipment> findEquipmentNotSeenSince(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    /**
     * Find equipment by OS name
     */
    List<Equipment> findByOsNameContainingIgnoreCase(String osName);
    
    /**
     * Find equipment with memory greater than specified GB
     */
    List<Equipment> findByMemoryGbGreaterThan(Integer memoryGb);
    
    /**
     * Find equipment with disk space greater than specified GB
     */
    List<Equipment> findByDiskGbGreaterThan(Integer diskGb);
    
    /**
     * Get distinct locations
     */
    @Query("SELECT DISTINCT e.location FROM Equipment e WHERE e.location IS NOT NULL ORDER BY e.location")
    List<String> findDistinctLocations();
    
    /**
     * Get distinct manufacturers
     */
    @Query("SELECT DISTINCT e.manufacturer FROM Equipment e WHERE e.manufacturer IS NOT NULL ORDER BY e.manufacturer")
    List<String> findDistinctManufacturers();
}

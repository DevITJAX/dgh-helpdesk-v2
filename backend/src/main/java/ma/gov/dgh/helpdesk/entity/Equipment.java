package ma.gov.dgh.helpdesk.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Equipment entity representing IT assets discovered through network scanning
 */
@Entity
@Table(name = "equipment", indexes = {
    @Index(name = "idx_equipment_ip", columnList = "ip_address"),
    @Index(name = "idx_equipment_mac", columnList = "mac_address"),
    @Index(name = "idx_equipment_hostname", columnList = "hostname"),
    @Index(name = "idx_equipment_type", columnList = "equipment_type"),
    @Index(name = "idx_equipment_location", columnList = "location"),
    @Index(name = "idx_equipment_status", columnList = "status")
})
public class Equipment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "hostname", length = 255)
    @Size(max = 255, message = "Hostname must not exceed 255 characters")
    private String hostname;
    
    @Column(name = "ip_address", length = 45)
    @Pattern(regexp = "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$", 
             message = "Invalid IP address format")
    private String ipAddress;
    
    @Column(name = "mac_address", length = 17)
    @Pattern(regexp = "^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$", 
             message = "Invalid MAC address format")
    private String macAddress;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "equipment_type", length = 50)
    private EquipmentType equipmentType;
    
    @Column(name = "manufacturer", length = 100)
    @Size(max = 100, message = "Manufacturer must not exceed 100 characters")
    private String manufacturer;
    
    @Column(name = "model", length = 100)
    @Size(max = 100, message = "Model must not exceed 100 characters")
    private String model;
    
    @Column(name = "serial_number", length = 100)
    @Size(max = 100, message = "Serial number must not exceed 100 characters")
    private String serialNumber;
    
    @Column(name = "os_name", length = 100)
    @Size(max = 100, message = "OS name must not exceed 100 characters")
    private String osName;
    
    @Column(name = "os_version", length = 100)
    @Size(max = 100, message = "OS version must not exceed 100 characters")
    private String osVersion;
    
    @Column(name = "location", length = 255)
    @Size(max = 255, message = "Location must not exceed 255 characters")
    private String location;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    private EquipmentStatus status = EquipmentStatus.UNKNOWN;
    
    @Column(name = "last_seen")
    private LocalDateTime lastSeen;
    
    @Lob
    @Column(name = "specifications")
    private String specifications; // JSON string containing detailed specs
    
    @Column(name = "cpu_info", length = 255)
    @Size(max = 255, message = "CPU info must not exceed 255 characters")
    private String cpuInfo;
    
    @Column(name = "memory_gb")
    private Integer memoryGb;
    
    @Column(name = "disk_gb")
    private Integer diskGb;
    
    @Column(name = "network_ports")
    private Integer networkPorts;
    
    @Column(name = "is_managed")
    private Boolean isManaged = false;
    
    @Column(name = "asset_tag", length = 50)
    @Size(max = 50, message = "Asset tag must not exceed 50 characters")
    private String assetTag;
    
    @Column(name = "purchase_date")
    private LocalDateTime purchaseDate;
    
    @Column(name = "warranty_expiry")
    private LocalDateTime warrantyExpiry;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "equipment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference(value = "equipment-tickets")
    private List<Ticket> tickets = new ArrayList<>();
    
    // Constructors
    public Equipment() {}
    
    public Equipment(String ipAddress, EquipmentType equipmentType) {
        this.ipAddress = ipAddress;
        this.equipmentType = equipmentType;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getHostname() {
        return hostname;
    }
    
    public void setHostname(String hostname) {
        this.hostname = hostname;
    }
    
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
    
    public String getSerialNumber() {
        return serialNumber;
    }
    
    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }
    
    public String getOsName() {
        return osName;
    }
    
    public void setOsName(String osName) {
        this.osName = osName;
    }
    
    public String getOsVersion() {
        return osVersion;
    }
    
    public void setOsVersion(String osVersion) {
        this.osVersion = osVersion;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public EquipmentStatus getStatus() {
        return status;
    }
    
    public void setStatus(EquipmentStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getLastSeen() {
        return lastSeen;
    }
    
    public void setLastSeen(LocalDateTime lastSeen) {
        this.lastSeen = lastSeen;
    }
    
    public String getSpecifications() {
        return specifications;
    }
    
    public void setSpecifications(String specifications) {
        this.specifications = specifications;
    }
    
    public String getCpuInfo() {
        return cpuInfo;
    }
    
    public void setCpuInfo(String cpuInfo) {
        this.cpuInfo = cpuInfo;
    }
    
    public Integer getMemoryGb() {
        return memoryGb;
    }
    
    public void setMemoryGb(Integer memoryGb) {
        this.memoryGb = memoryGb;
    }
    
    public Integer getDiskGb() {
        return diskGb;
    }
    
    public void setDiskGb(Integer diskGb) {
        this.diskGb = diskGb;
    }
    
    public Integer getNetworkPorts() {
        return networkPorts;
    }
    
    public void setNetworkPorts(Integer networkPorts) {
        this.networkPorts = networkPorts;
    }
    
    public Boolean getIsManaged() {
        return isManaged;
    }
    
    public void setIsManaged(Boolean isManaged) {
        this.isManaged = isManaged;
    }
    
    public String getAssetTag() {
        return assetTag;
    }
    
    public void setAssetTag(String assetTag) {
        this.assetTag = assetTag;
    }
    
    public LocalDateTime getPurchaseDate() {
        return purchaseDate;
    }
    
    public void setPurchaseDate(LocalDateTime purchaseDate) {
        this.purchaseDate = purchaseDate;
    }
    
    public LocalDateTime getWarrantyExpiry() {
        return warrantyExpiry;
    }
    
    public void setWarrantyExpiry(LocalDateTime warrantyExpiry) {
        this.warrantyExpiry = warrantyExpiry;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public List<Ticket> getTickets() {
        return tickets;
    }
    
    public void setTickets(List<Ticket> tickets) {
        this.tickets = tickets;
    }
    
    // Utility methods
    public boolean isOnline() {
        return status == EquipmentStatus.ONLINE;
    }
    
    public boolean isOffline() {
        return status == EquipmentStatus.OFFLINE;
    }
    
    @Override
    public String toString() {
        return "Equipment{" +
                "id=" + id +
                ", hostname='" + hostname + '\'' +
                ", ipAddress='" + ipAddress + '\'' +
                ", equipmentType=" + equipmentType +
                ", status=" + status +
                ", location='" + location + '\'' +
                '}';
    }
}

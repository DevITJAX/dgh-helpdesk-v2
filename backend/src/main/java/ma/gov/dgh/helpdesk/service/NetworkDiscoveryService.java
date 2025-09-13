package ma.gov.dgh.helpdesk.service;

import ma.gov.dgh.helpdesk.entity.Equipment;
import ma.gov.dgh.helpdesk.entity.EquipmentType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service for automated network discovery and equipment scanning
 */
@Service
public class NetworkDiscoveryService {
    
    private static final Logger logger = LoggerFactory.getLogger(NetworkDiscoveryService.class);
    
    private final EquipmentService equipmentService;
    private final SnmpService snmpService;
    
    @Value("${network.discovery.enabled:true}")
    private boolean discoveryEnabled;
    
    @Value("${network.discovery.subnet-ranges:192.168.1.0/24}")
    private String subnetRanges;
    
    @Autowired
    public NetworkDiscoveryService(EquipmentService equipmentService, SnmpService snmpService) {
        this.equipmentService = equipmentService;
        this.snmpService = snmpService;
    }
    
    /**
     * Scheduled network discovery - runs every hour
     */
    @Scheduled(fixedRateString = "${network.discovery.scan-interval:3600000}")
    public void scheduledNetworkScan() {
        if (!discoveryEnabled) {
            logger.info("Network discovery is disabled");
            return;
        }
        
        logger.info("Starting scheduled network discovery scan");
        performNetworkDiscovery();
    }
    
    /**
     * Manual network discovery trigger
     */
    @Async
    public CompletableFuture<List<Equipment>> performNetworkDiscovery() {
        logger.info("Starting network discovery for subnets: {}", subnetRanges);
        
        List<Equipment> discoveredEquipment = new ArrayList<>();
        String[] subnets = subnetRanges.split(",");
        
        for (String subnet : subnets) {
            try {
                List<Equipment> subnetEquipment = scanSubnet(subnet.trim());
                discoveredEquipment.addAll(subnetEquipment);
            } catch (Exception e) {
                logger.error("Error scanning subnet {}: {}", subnet, e.getMessage());
            }
        }
        
        logger.info("Network discovery completed. Found {} devices", discoveredEquipment.size());
        return CompletableFuture.completedFuture(discoveredEquipment);
    }
    
    /**
     * Scan a specific subnet for devices
     */
    private List<Equipment> scanSubnet(String subnet) {
        logger.info("Scanning subnet: {}", subnet);
        List<Equipment> equipment = new ArrayList<>();
        
        try {
            List<String> activeIps = performPingScan(subnet);
            
            for (String ip : activeIps) {
                try {
                    Equipment device = discoverDevice(ip);
                    if (device != null) {
                        equipment.add(device);
                    }
                } catch (Exception e) {
                    logger.warn("Error discovering device at {}: {}", ip, e.getMessage());
                }
            }
        } catch (Exception e) {
            logger.error("Error scanning subnet {}: {}", subnet, e.getMessage());
        }
        
        return equipment;
    }
    
    /**
     * Perform ping scan to find active IPs
     */
    private List<String> performPingScan(String subnet) {
        List<String> activeIps = new ArrayList<>();
        
        try {
            // Use nmap for network scanning if available
            if (isNmapAvailable()) {
                activeIps = performNmapScan(subnet);
            } else {
                // Fallback to Java ping
                activeIps = performJavaPingScan(subnet);
            }
        } catch (Exception e) {
            logger.error("Error performing ping scan: {}", e.getMessage());
        }
        
        return activeIps;
    }
    
    /**
     * Check if nmap is available on the system
     */
    private boolean isNmapAvailable() {
        try {
            Process process = Runtime.getRuntime().exec("nmap --version");
            int exitCode = process.waitFor();
            return exitCode == 0;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Perform network scan using nmap
     */
    private List<String> performNmapScan(String subnet) throws IOException, InterruptedException {
        List<String> activeIps = new ArrayList<>();
        
        String command = "nmap -sn " + subnet;
        Process process = Runtime.getRuntime().exec(command);
        
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            Pattern ipPattern = Pattern.compile("\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b");
            
            while ((line = reader.readLine()) != null) {
                if (line.contains("Nmap scan report for")) {
                    Matcher matcher = ipPattern.matcher(line);
                    if (matcher.find()) {
                        activeIps.add(matcher.group());
                    }
                }
            }
        }
        
        process.waitFor();
        return activeIps;
    }
    
    /**
     * Fallback ping scan using Java
     */
    private List<String> performJavaPingScan(String subnet) {
        List<String> activeIps = new ArrayList<>();
        
        // Parse subnet (simple implementation for /24 networks)
        if (subnet.endsWith("/24")) {
            String baseIp = subnet.substring(0, subnet.lastIndexOf('.'));
            
            for (int i = 1; i < 255; i++) {
                String ip = baseIp + "." + i;
                try {
                    InetAddress address = InetAddress.getByName(ip);
                    if (address.isReachable(1000)) { // 1 second timeout
                        activeIps.add(ip);
                    }
                } catch (Exception e) {
                    // Ignore unreachable hosts
                }
            }
        }
        
        return activeIps;
    }
    
    /**
     * Discover device information for a specific IP
     */
    private Equipment discoverDevice(String ipAddress) {
        logger.debug("Discovering device at IP: {}", ipAddress);
        
        try {
            // Get hostname
            String hostname = getHostname(ipAddress);
            
            // Get MAC address (if possible)
            String macAddress = getMacAddress(ipAddress);
            
            // Try SNMP discovery for additional information
            SnmpDeviceInfo snmpInfo = snmpService.getDeviceInfo(ipAddress);
            
            // Determine equipment type
            EquipmentType equipmentType = determineEquipmentType(snmpInfo, hostname);
            
            // Create or update equipment
            Equipment equipment = equipmentService.createOrUpdateFromDiscovery(
                ipAddress,
                macAddress,
                hostname,
                equipmentType,
                snmpInfo != null ? snmpInfo.getManufacturer() : null,
                snmpInfo != null ? snmpInfo.getModel() : null
            );
            
            // Set additional SNMP information
            if (snmpInfo != null) {
                equipment.setOsName(snmpInfo.getOsName());
                equipment.setOsVersion(snmpInfo.getOsVersion());
                equipment.setSpecifications(snmpInfo.toJson());
            }
            
            logger.info("Discovered device: {} ({})", hostname, ipAddress);
            return equipment;
            
        } catch (Exception e) {
            logger.warn("Failed to discover device at {}: {}", ipAddress, e.getMessage());
            return null;
        }
    }
    
    /**
     * Get hostname for IP address
     */
    private String getHostname(String ipAddress) {
        try {
            InetAddress address = InetAddress.getByName(ipAddress);
            String hostname = address.getHostName();
            return hostname.equals(ipAddress) ? null : hostname;
        } catch (UnknownHostException e) {
            return null;
        }
    }
    
    /**
     * Get MAC address for IP (using ARP table)
     */
    private String getMacAddress(String ipAddress) {
        try {
            // Try to get MAC address from ARP table
            Process process = Runtime.getRuntime().exec("arp -a " + ipAddress);
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line = reader.readLine();
                if (line != null) {
                    Pattern macPattern = Pattern.compile("([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})");
                    Matcher matcher = macPattern.matcher(line);
                    if (matcher.find()) {
                        return matcher.group();
                    }
                }
            }
            process.waitFor();
        } catch (Exception e) {
            logger.debug("Could not get MAC address for {}: {}", ipAddress, e.getMessage());
        }
        return null;
    }
    
    /**
     * Determine equipment type based on available information
     */
    private EquipmentType determineEquipmentType(SnmpDeviceInfo snmpInfo, String hostname) {
        if (snmpInfo != null) {
            String sysDescr = snmpInfo.getSystemDescription();
            if (sysDescr != null) {
                String sysDescrLower = sysDescr.toLowerCase();
                
                if (sysDescrLower.contains("switch")) {
                    return EquipmentType.SWITCH;
                } else if (sysDescrLower.contains("router")) {
                    return EquipmentType.ROUTER;
                } else if (sysDescrLower.contains("printer")) {
                    return EquipmentType.PRINTER;
                } else if (sysDescrLower.contains("access point") || sysDescrLower.contains("ap")) {
                    return EquipmentType.ACCESS_POINT;
                } else if (sysDescrLower.contains("server")) {
                    return EquipmentType.SERVER;
                } else if (sysDescrLower.contains("windows") || sysDescrLower.contains("linux")) {
                    return EquipmentType.DESKTOP;
                }
            }
        }
        
        // Try to determine from hostname
        if (hostname != null) {
            String hostnameLower = hostname.toLowerCase();
            if (hostnameLower.contains("switch")) {
                return EquipmentType.SWITCH;
            } else if (hostnameLower.contains("router")) {
                return EquipmentType.ROUTER;
            } else if (hostnameLower.contains("printer")) {
                return EquipmentType.PRINTER;
            } else if (hostnameLower.contains("server")) {
                return EquipmentType.SERVER;
            }
        }
        
        // Default to unknown
        return EquipmentType.UNKNOWN;
    }
    
    /**
     * Scan specific IP address
     */
    @Async
    public CompletableFuture<Equipment> scanSingleDevice(String ipAddress) {
        logger.info("Scanning single device: {}", ipAddress);
        
        Equipment equipment = discoverDevice(ipAddress);
        
        if (equipment != null) {
            logger.info("Successfully scanned device: {}", ipAddress);
        } else {
            logger.warn("Failed to scan device: {}", ipAddress);
        }
        
        return CompletableFuture.completedFuture(equipment);
    }
    
    /**
     * Get discovery status
     */
    public DiscoveryStatus getDiscoveryStatus() {
        return new DiscoveryStatus(discoveryEnabled, subnetRanges);
    }
    
    /**
     * Inner class for discovery status
     */
    public static class DiscoveryStatus {
        private final boolean enabled;
        private final String subnetRanges;
        
        public DiscoveryStatus(boolean enabled, String subnetRanges) {
            this.enabled = enabled;
            this.subnetRanges = subnetRanges;
        }
        
        public boolean isEnabled() {
            return enabled;
        }
        
        public String getSubnetRanges() {
            return subnetRanges;
        }
    }
}

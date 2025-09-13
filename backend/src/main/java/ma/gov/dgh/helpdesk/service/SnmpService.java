package ma.gov.dgh.helpdesk.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.snmp4j.*;
import org.snmp4j.event.ResponseEvent;
import org.snmp4j.mp.SnmpConstants;
import org.snmp4j.smi.*;
import org.snmp4j.transport.DefaultUdpTransportMapping;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for SNMP operations to gather device information
 */
@Service
public class SnmpService {
    
    private static final Logger logger = LoggerFactory.getLogger(SnmpService.class);
    
    @Value("${network.discovery.snmp.community:public}")
    private String snmpCommunity;
    
    @Value("${network.discovery.snmp.timeout:5000}")
    private long snmpTimeout;
    
    // Standard SNMP OIDs
    private static final String OID_SYSTEM_DESCRIPTION = "1.3.6.1.2.1.1.1.0";
    private static final String OID_SYSTEM_OBJECT_ID = "1.3.6.1.2.1.1.2.0";
    private static final String OID_SYSTEM_UPTIME = "1.3.6.1.2.1.1.3.0";
    private static final String OID_SYSTEM_CONTACT = "1.3.6.1.2.1.1.4.0";
    private static final String OID_SYSTEM_NAME = "1.3.6.1.2.1.1.5.0";
    private static final String OID_SYSTEM_LOCATION = "1.3.6.1.2.1.1.6.0";
    private static final String OID_SYSTEM_SERVICES = "1.3.6.1.2.1.1.7.0";
    
    // Interface information
    private static final String OID_IF_NUMBER = "1.3.6.1.2.1.2.1.0";
    private static final String OID_IF_DESCR = "1.3.6.1.2.1.2.2.1.2";
    private static final String OID_IF_TYPE = "1.3.6.1.2.1.2.2.1.3";
    private static final String OID_IF_SPEED = "1.3.6.1.2.1.2.2.1.5";
    private static final String OID_IF_PHYS_ADDRESS = "1.3.6.1.2.1.2.2.1.6";
    
    // Host resources (for servers/workstations)
    private static final String OID_HR_SYSTEM_UPTIME = "1.3.6.1.2.1.25.1.1.0";
    private static final String OID_HR_SYSTEM_DATE = "1.3.6.1.2.1.25.1.2.0";
    private static final String OID_HR_SYSTEM_PROCESSES = "1.3.6.1.2.1.25.1.6.0";
    private static final String OID_HR_SYSTEM_MAX_PROCESSES = "1.3.6.1.2.1.25.1.7.0";
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * Get device information via SNMP
     */
    public SnmpDeviceInfo getDeviceInfo(String ipAddress) {
        try {
            Snmp snmp = createSnmpSession();
            Target target = createTarget(ipAddress);
            
            SnmpDeviceInfo deviceInfo = new SnmpDeviceInfo();
            deviceInfo.setIpAddress(ipAddress);
            
            // Get system information
            deviceInfo.setSystemDescription(getSnmpValue(snmp, target, OID_SYSTEM_DESCRIPTION));
            deviceInfo.setSystemName(getSnmpValue(snmp, target, OID_SYSTEM_NAME));
            deviceInfo.setSystemLocation(getSnmpValue(snmp, target, OID_SYSTEM_LOCATION));
            deviceInfo.setSystemContact(getSnmpValue(snmp, target, OID_SYSTEM_CONTACT));
            deviceInfo.setSystemUptime(getSnmpValue(snmp, target, OID_SYSTEM_UPTIME));
            
            // Parse manufacturer and model from system description
            parseManufacturerAndModel(deviceInfo);
            
            // Get interface count
            String ifNumber = getSnmpValue(snmp, target, OID_IF_NUMBER);
            if (ifNumber != null) {
                try {
                    deviceInfo.setInterfaceCount(Integer.parseInt(ifNumber));
                } catch (NumberFormatException e) {
                    logger.debug("Could not parse interface count: {}", ifNumber);
                }
            }
            
            // Get host resources information (if available)
            String hrProcesses = getSnmpValue(snmp, target, OID_HR_SYSTEM_PROCESSES);
            if (hrProcesses != null) {
                deviceInfo.setProcessCount(hrProcesses);
            }
            
            snmp.close();
            
            logger.debug("Retrieved SNMP info for {}: {}", ipAddress, deviceInfo.getSystemDescription());
            return deviceInfo;
            
        } catch (Exception e) {
            logger.debug("SNMP query failed for {}: {}", ipAddress, e.getMessage());
            return null;
        }
    }
    
    /**
     * Create SNMP session
     */
    private Snmp createSnmpSession() throws IOException {
        TransportMapping<?> transport = new DefaultUdpTransportMapping();
        Snmp snmp = new Snmp(transport);
        transport.listen();
        return snmp;
    }
    
    /**
     * Create SNMP target
     */
    private Target createTarget(String ipAddress) {
        CommunityTarget target = new CommunityTarget();
        target.setCommunity(new OctetString(snmpCommunity));
        target.setAddress(GenericAddress.parse("udp:" + ipAddress + "/161"));
        target.setRetries(2);
        target.setTimeout(snmpTimeout);
        target.setVersion(SnmpConstants.version2c);
        return target;
    }
    
    /**
     * Get SNMP value for a specific OID
     */
    private String getSnmpValue(Snmp snmp, Target target, String oid) {
        try {
            PDU pdu = new PDU();
            pdu.add(new VariableBinding(new OID(oid)));
            pdu.setType(PDU.GET);
            
            ResponseEvent event = snmp.send(pdu, target, null);
            if (event != null && event.getResponse() != null) {
                PDU response = event.getResponse();
                if (response.getErrorStatus() == 0) {
                    VariableBinding vb = response.get(0);
                    if (vb.getVariable() != null && !vb.getVariable().isException()) {
                        return vb.getVariable().toString();
                    }
                }
            }
        } catch (IOException e) {
            logger.debug("SNMP GET failed for OID {}: {}", oid, e.getMessage());
        }
        return null;
    }
    
    /**
     * Parse manufacturer and model from system description
     */
    private void parseManufacturerAndModel(SnmpDeviceInfo deviceInfo) {
        String sysDescr = deviceInfo.getSystemDescription();
        if (sysDescr == null) return;
        
        String sysDescrLower = sysDescr.toLowerCase();
        
        // Common manufacturer patterns
        if (sysDescrLower.contains("cisco")) {
            deviceInfo.setManufacturer("Cisco");
            parseModelFromDescription(deviceInfo, sysDescr, "cisco");
        } else if (sysDescrLower.contains("hp") || sysDescrLower.contains("hewlett")) {
            deviceInfo.setManufacturer("HP");
            parseModelFromDescription(deviceInfo, sysDescr, "hp");
        } else if (sysDescrLower.contains("dell")) {
            deviceInfo.setManufacturer("Dell");
            parseModelFromDescription(deviceInfo, sysDescr, "dell");
        } else if (sysDescrLower.contains("juniper")) {
            deviceInfo.setManufacturer("Juniper");
            parseModelFromDescription(deviceInfo, sysDescr, "juniper");
        } else if (sysDescrLower.contains("netgear")) {
            deviceInfo.setManufacturer("Netgear");
            parseModelFromDescription(deviceInfo, sysDescr, "netgear");
        } else if (sysDescrLower.contains("d-link")) {
            deviceInfo.setManufacturer("D-Link");
            parseModelFromDescription(deviceInfo, sysDescr, "d-link");
        } else if (sysDescrLower.contains("windows")) {
            deviceInfo.setManufacturer("Microsoft");
            deviceInfo.setOsName("Windows");
            parseWindowsVersion(deviceInfo, sysDescr);
        } else if (sysDescrLower.contains("linux")) {
            deviceInfo.setOsName("Linux");
            parseLinuxDistribution(deviceInfo, sysDescr);
        }
    }
    
    /**
     * Parse model from system description
     */
    private void parseModelFromDescription(SnmpDeviceInfo deviceInfo, String sysDescr, String manufacturer) {
        // This is a simplified parser - in practice, you'd have more sophisticated parsing
        String[] parts = sysDescr.split("\\s+");
        for (int i = 0; i < parts.length; i++) {
            if (parts[i].toLowerCase().contains(manufacturer.toLowerCase()) && i + 1 < parts.length) {
                deviceInfo.setModel(parts[i + 1]);
                break;
            }
        }
    }
    
    /**
     * Parse Windows version from system description
     */
    private void parseWindowsVersion(SnmpDeviceInfo deviceInfo, String sysDescr) {
        if (sysDescr.contains("Windows Server")) {
            deviceInfo.setOsVersion("Server");
        } else if (sysDescr.contains("Windows 10")) {
            deviceInfo.setOsVersion("10");
        } else if (sysDescr.contains("Windows 11")) {
            deviceInfo.setOsVersion("11");
        }
    }
    
    /**
     * Parse Linux distribution from system description
     */
    private void parseLinuxDistribution(SnmpDeviceInfo deviceInfo, String sysDescr) {
        String sysDescrLower = sysDescr.toLowerCase();
        if (sysDescrLower.contains("ubuntu")) {
            deviceInfo.setManufacturer("Ubuntu");
        } else if (sysDescrLower.contains("centos")) {
            deviceInfo.setManufacturer("CentOS");
        } else if (sysDescrLower.contains("red hat")) {
            deviceInfo.setManufacturer("Red Hat");
        } else if (sysDescrLower.contains("debian")) {
            deviceInfo.setManufacturer("Debian");
        }
    }
    
    /**
     * Test SNMP connectivity to a device
     */
    public boolean testSnmpConnectivity(String ipAddress) {
        try {
            Snmp snmp = createSnmpSession();
            Target target = createTarget(ipAddress);
            
            String sysDescr = getSnmpValue(snmp, target, OID_SYSTEM_DESCRIPTION);
            snmp.close();
            
            return sysDescr != null;
        } catch (Exception e) {
            return false;
        }
    }
}

/**
 * Class to hold SNMP device information
 */
class SnmpDeviceInfo {
    private String ipAddress;
    private String systemDescription;
    private String systemName;
    private String systemLocation;
    private String systemContact;
    private String systemUptime;
    private String manufacturer;
    private String model;
    private String osName;
    private String osVersion;
    private Integer interfaceCount;
    private String processCount;
    
    // Getters and setters
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    
    public String getSystemDescription() { return systemDescription; }
    public void setSystemDescription(String systemDescription) { this.systemDescription = systemDescription; }
    
    public String getSystemName() { return systemName; }
    public void setSystemName(String systemName) { this.systemName = systemName; }
    
    public String getSystemLocation() { return systemLocation; }
    public void setSystemLocation(String systemLocation) { this.systemLocation = systemLocation; }
    
    public String getSystemContact() { return systemContact; }
    public void setSystemContact(String systemContact) { this.systemContact = systemContact; }
    
    public String getSystemUptime() { return systemUptime; }
    public void setSystemUptime(String systemUptime) { this.systemUptime = systemUptime; }
    
    public String getManufacturer() { return manufacturer; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }
    
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    
    public String getOsName() { return osName; }
    public void setOsName(String osName) { this.osName = osName; }
    
    public String getOsVersion() { return osVersion; }
    public void setOsVersion(String osVersion) { this.osVersion = osVersion; }
    
    public Integer getInterfaceCount() { return interfaceCount; }
    public void setInterfaceCount(Integer interfaceCount) { this.interfaceCount = interfaceCount; }
    
    public String getProcessCount() { return processCount; }
    public void setProcessCount(String processCount) { this.processCount = processCount; }
    
    /**
     * Convert to JSON string for storage
     */
    public String toJson() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> data = new HashMap<>();
            data.put("systemDescription", systemDescription);
            data.put("systemName", systemName);
            data.put("systemLocation", systemLocation);
            data.put("systemContact", systemContact);
            data.put("systemUptime", systemUptime);
            data.put("interfaceCount", interfaceCount);
            data.put("processCount", processCount);
            return mapper.writeValueAsString(data);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }
}

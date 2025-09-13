package ma.gov.dgh.helpdesk.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Configuration class for LDAP settings
 */
@Configuration
@ConfigurationProperties(prefix = "ldap.server")
@Profile("prod")
public class LdapConfig {
    
    private String url = "ldap://68.221.171.67:389";
    private String domain = "dgh.local";
    private String bindUser = "CN=adminuser,CN=Users,DC=dgh,DC=local";
    private String bindPassword = "Dgh@2025Bind!";
    private String searchBase = "CN=Users,DC=dgh,DC=local";
    
    // Getters and Setters
    public String getUrl() {
        return url;
    }
    
    public void setUrl(String url) {
        this.url = url;
    }
    
    public String getDomain() {
        return domain;
    }
    
    public void setDomain(String domain) {
        this.domain = domain;
    }
    
    public String getBindUser() {
        return bindUser;
    }
    
    public void setBindUser(String bindUser) {
        this.bindUser = bindUser;
    }
    
    public String getBindPassword() {
        return bindPassword;
    }
    
    public void setBindPassword(String bindPassword) {
        this.bindPassword = bindPassword;
    }
    
    public String getSearchBase() {
        return searchBase;
    }
    
    public void setSearchBase(String searchBase) {
        this.searchBase = searchBase;
    }
}


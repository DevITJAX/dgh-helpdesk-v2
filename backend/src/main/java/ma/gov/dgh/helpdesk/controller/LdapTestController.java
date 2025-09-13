package ma.gov.dgh.helpdesk.controller;

import ma.gov.dgh.helpdesk.config.LdapConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

import javax.naming.Context;
import javax.naming.NamingException;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import java.util.Hashtable;

/**
 * Test controller for LDAP debugging
 */
@RestController
@RequestMapping("/api/test")
@Profile("prod")
public class LdapTestController {

    @Autowired
    private LdapConfig ldapConfig;

    @GetMapping("/ldap-connection")
    public String testLdapConnection() {
        try {
            Hashtable<String, String> env = new Hashtable<>();
            env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
            env.put(Context.PROVIDER_URL, ldapConfig.getUrl());
            env.put(Context.SECURITY_AUTHENTICATION, "simple");
            env.put(Context.SECURITY_PRINCIPAL, ldapConfig.getBindUser());
            env.put(Context.SECURITY_CREDENTIALS, ldapConfig.getBindPassword());
            env.put(Context.REFERRAL, "follow");
            env.put("com.sun.jndi.ldap.connect.timeout", "5000");
            env.put("com.sun.jndi.ldap.read.timeout", "5000");

            DirContext ctx = new InitialDirContext(env);
            ctx.close();
            return "LDAP connection successful!";
        } catch (NamingException e) {
            return "LDAP connection failed: " + e.getMessage();
        }
    }

    @PostMapping("/ldap-auth")
    public String testLdapAuth(@RequestParam String username, @RequestParam String password) {
        try {
            Hashtable<String, String> env = new Hashtable<>();
            env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
            env.put(Context.PROVIDER_URL, ldapConfig.getUrl());
            env.put(Context.SECURITY_AUTHENTICATION, "simple");
            env.put(Context.SECURITY_PRINCIPAL, username + "@" + ldapConfig.getDomain());
            env.put(Context.SECURITY_CREDENTIALS, password);
            env.put(Context.REFERRAL, "follow");
            env.put("com.sun.jndi.ldap.connect.timeout", "5000");
            env.put("com.sun.jndi.ldap.read.timeout", "5000");

            DirContext ctx = new InitialDirContext(env);
            ctx.close();
            return "Authentication successful for user: " + username;
        } catch (NamingException e) {
            return "Authentication failed for user: " + username + " - " + e.getMessage();
        }
    }

    @GetMapping("/ldap-config")
    public String getLdapConfig() {
        return "LDAP Config - URL: " + ldapConfig.getUrl() + 
               ", Domain: " + ldapConfig.getDomain() + 
               ", Bind User: " + ldapConfig.getBindUser() + 
               ", Search Base: " + ldapConfig.getSearchBase();
    }
}

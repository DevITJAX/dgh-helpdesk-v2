package ma.gov.dgh.helpdesk;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import javax.naming.Context;
import javax.naming.NamingException;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import java.util.Hashtable;

/**
 * Test class to verify LDAP connection and authentication
 * This is a manual test to verify the LDAP configuration
 */
@SpringBootTest
@ActiveProfiles("prod")
public class LdapConnectionTest {

    @Test
    public void testLdapConnection() {
        System.out.println("Testing LDAP connection to Azure Windows Server...");
        
        try {
            // Test basic connection
            Hashtable<String, String> env = new Hashtable<>();
            env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
            env.put(Context.PROVIDER_URL, "ldap://68.221.171.67:389");
            env.put(Context.SECURITY_AUTHENTICATION, "simple");
            env.put(Context.SECURITY_PRINCIPAL, "CN=adminuser,CN=Users,DC=dgh,DC=local");
            env.put(Context.SECURITY_CREDENTIALS, "Dgh@2025Bind!");
            env.put(Context.REFERRAL, "follow");
            env.put("com.sun.jndi.ldap.connect.timeout", "5000");
            env.put("com.sun.jndi.ldap.read.timeout", "5000");
            
            DirContext ctx = new InitialDirContext(env);
            System.out.println("✓ LDAP connection successful!");
            ctx.close();
            
        } catch (NamingException e) {
            System.err.println("✗ LDAP connection failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    @Test
    public void testUserAuthentication() {
        System.out.println("Testing user authentication...");
        
        // Test credentials provided by user
        String[][] testUsers = {
            {"aalami", "Dgh@2025Pwd!", "ADMIN (Helpdesk_Admin group)"},
            {"fbenali", "Dgh@2025Pwd!", "ADMIN (Helpdesk_Admin group)"},
            {"ochakir", "Dgh@2025Pwd!", "TECHNICIAN (Helpdesk_Tech group)"},
            {"amansouri", "Dgh@2025Pwd!", "TECHNICIAN (Helpdesk_Tech group)"},
            {"yidrissi", "Dgh@2025Pwd!", "EMPLOYEE (Helpdesk_User group)"},
            {"ktazi", "Dgh@2025Pwd!", "EMPLOYEE (Helpdesk_User group)"}
        };
        
        for (String[] user : testUsers) {
            String username = user[0];
            String password = user[1];
            String expectedRole = user[2];
            
            try {
                Hashtable<String, String> env = new Hashtable<>();
                env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
                env.put(Context.PROVIDER_URL, "ldap://68.221.171.67:389");
                env.put(Context.SECURITY_AUTHENTICATION, "simple");
                env.put(Context.SECURITY_PRINCIPAL, username + "@dgh.local");
                env.put(Context.SECURITY_CREDENTIALS, password);
                env.put(Context.REFERRAL, "follow");
                env.put("com.sun.jndi.ldap.connect.timeout", "5000");
                env.put("com.sun.jndi.ldap.read.timeout", "5000");
                
                DirContext ctx = new InitialDirContext(env);
                System.out.println("✓ Authentication successful for user: " + username + " (Role: " + expectedRole + ")");
                ctx.close();
                
            } catch (NamingException e) {
                System.err.println("✗ Authentication failed for user: " + username + " - " + e.getMessage());
            }
        }
    }
    
    @Test
    public void testUserInfoRetrieval() {
        System.out.println("Testing user information retrieval...");
        
        try {
            // Connect as bind user
            Hashtable<String, String> env = new Hashtable<>();
            env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
            env.put(Context.PROVIDER_URL, "ldap://68.221.171.67:389");
            env.put(Context.SECURITY_AUTHENTICATION, "simple");
            env.put(Context.SECURITY_PRINCIPAL, "CN=adminuser,CN=Users,DC=dgh,DC=local");
            env.put(Context.SECURITY_CREDENTIALS, "Dgh@2025Bind!");
            env.put(Context.REFERRAL, "follow");
            
            DirContext ctx = new InitialDirContext(env);
            
            // Search for a test user
            String searchBase = "CN=Users,DC=dgh,DC=local";
            String searchFilter = "(&(objectClass=user)(sAMAccountName=aalami))";
            
            javax.naming.directory.SearchControls searchControls = new javax.naming.directory.SearchControls();
            searchControls.setSearchScope(javax.naming.directory.SearchControls.SUBTREE_SCOPE);
            searchControls.setReturningAttributes(new String[]{"displayName", "mail", "department", "memberOf"});
            
            javax.naming.NamingEnumeration<javax.naming.directory.SearchResult> results = 
                ctx.search(searchBase, searchFilter, searchControls);
            
            if (results.hasMore()) {
                javax.naming.directory.SearchResult result = results.next();
                javax.naming.directory.Attributes attrs = result.getAttributes();
                
                System.out.println("✓ User information retrieved successfully:");
                if (attrs.get("displayName") != null) {
                    System.out.println("  Display Name: " + attrs.get("displayName").get());
                }
                if (attrs.get("mail") != null) {
                    System.out.println("  Email: " + attrs.get("mail").get());
                }
                if (attrs.get("department") != null) {
                    System.out.println("  Department: " + attrs.get("department").get());
                }
                if (attrs.get("memberOf") != null) {
                    System.out.println("  Groups:");
                    javax.naming.NamingEnumeration<?> groups = attrs.get("memberOf").getAll();
                    while (groups.hasMore()) {
                        System.out.println("    - " + groups.next());
                    }
                }
            } else {
                System.out.println("✗ No user found with sAMAccountName: aalami");
            }
            
            ctx.close();
            
        } catch (Exception e) {
            System.err.println("✗ User information retrieval failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}


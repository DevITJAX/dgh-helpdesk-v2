package ma.gov.dgh.helpdesk.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Custom filter to ensure security context is properly restored from session
 */
@Component
public class SessionRestorationFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpSession session = httpRequest.getSession(false);
        
        System.out.println("=== SESSION RESTORATION FILTER ===");
        System.out.println("Request URI: " + httpRequest.getRequestURI());
        System.out.println("Request method: " + httpRequest.getMethod());
        System.out.println("Session ID: " + (session != null ? session.getId() : "NO SESSION"));
        System.out.println("Cookies: " + java.util.Arrays.toString(httpRequest.getCookies()));
        System.out.println("Origin: " + httpRequest.getHeader("Origin"));
        System.out.println("Referer: " + httpRequest.getHeader("Referer"));
        
        if (session != null) {
            Object securityContext = session.getAttribute("SPRING_SECURITY_CONTEXT");
            System.out.println("Security context in session: " + (securityContext != null ? "EXISTS" : "NULL"));
            
            if (securityContext instanceof SecurityContextImpl) {
                SecurityContextImpl context = (SecurityContextImpl) securityContext;
                System.out.println("Restoring security context from session");
                SecurityContextHolder.setContext(context);
                System.out.println("Security context restored: " + SecurityContextHolder.getContext().getAuthentication());
            }
        } else {
            System.out.println("No session found - creating new session");
            session = httpRequest.getSession(true);
            System.out.println("New session created with ID: " + session.getId());
        }
        
        chain.doFilter(request, response);
    }
}

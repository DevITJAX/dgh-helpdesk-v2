package ma.gov.dgh.helpdesk.config;

import ma.gov.dgh.helpdesk.security.CustomLdapAuthenticationProvider;
import ma.gov.dgh.helpdesk.security.SessionRestorationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@Profile("prod") // Only active in production profile
public class SimpleSecurityConfig {

    private final CustomLdapAuthenticationProvider customLdapAuthenticationProvider;
    private final SessionRestorationFilter sessionRestorationFilter;

    public SimpleSecurityConfig(CustomLdapAuthenticationProvider customLdapAuthenticationProvider, SessionRestorationFilter sessionRestorationFilter) {
        this.customLdapAuthenticationProvider = customLdapAuthenticationProvider;
        this.sessionRestorationFilter = sessionRestorationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/api/health/**").permitAll()
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers("/api/auth/logout").permitAll()
                .requestMatchers("/api/test/**").permitAll()
                .requestMatchers("/api/auth/test-json").permitAll()
                .requestMatchers("/api/auth/test-json-object").permitAll()
                .requestMatchers("/api/auth/me").authenticated()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            )
            .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable()))
            .sessionManagement(session -> session
                .sessionCreationPolicy(org.springframework.security.config.http.SessionCreationPolicy.ALWAYS)
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false)
            )
            .httpBasic(httpBasic -> {})
            .formLogin(form -> {})
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    if (request.getRequestURI().startsWith("/api/")) {
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.setContentType("application/json");
                        response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Authentication required\"}");
                    } else {
                        response.sendRedirect("/login");
                    }
                })
            )
            .addFilterBefore(sessionRestorationFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder auth = http.getSharedObject(AuthenticationManagerBuilder.class);
        auth.authenticationProvider(customLdapAuthenticationProvider);
        return auth.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow localhost for development and Azure domains for production
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:*", 
            "https://localhost:*",
            "http://127.0.0.1:*",
            "https://127.0.0.1:*",
            "http://*.azurecontainer.io",
            "https://*.azurecontainer.io",
            "https://*.azurecontainerapps.io",
            "https://*.azurewebsites.net",
            "https://*.azure.com",
            "https://*.cloudapp.azure.com",
            "http://dgh-helpdesk-frontend-westus2.westus2.azurecontainer.io",
            "http://dgh-helpdesk-backend-westus2.westus2.azurecontainer.io"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type", "Set-Cookie"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

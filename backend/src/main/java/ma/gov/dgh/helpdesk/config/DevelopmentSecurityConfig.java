package ma.gov.dgh.helpdesk.config;

import ma.gov.dgh.helpdesk.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import ma.gov.dgh.helpdesk.security.JwtTokenProvider;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@Profile("dev") // Only active in development profile
public class DevelopmentSecurityConfig {

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(UserDetailsService userDetailsService, JwtTokenProvider tokenProvider) {
        return new JwtAuthenticationFilter(tokenProvider, userDetailsService);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/api/health/**").permitAll()
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers("/api/auth/logout").permitAll()
                .requestMatchers("/api/auth/check").permitAll()
                .requestMatchers("/api/auth/me").permitAll()
                .requestMatchers("/api/auth/verify").permitAll()
                .requestMatchers("/api/test/**").permitAll()  // Allow test endpoints
                .requestMatchers("/api/dashboard/**").permitAll()  // Temporarily allow dashboard endpoints for testing
                .requestMatchers("/api/users/**").permitAll()  // Temporarily allow user endpoints for testing
                .requestMatchers("/api/users/profile").permitAll()  // Temporarily allow profile updates for testing
                .requestMatchers("/api/tickets/samples/create").permitAll()  // Allow ticket creation for testing
                .requestMatchers("/api/tickets/**").permitAll()  // Temporarily allow all ticket endpoints for testing
                .requestMatchers("/api/equipment/**").permitAll()  // Temporarily allow all equipment endpoints for testing
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            )
            .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable()))
            .sessionManagement(session -> session
                .sessionCreationPolicy(org.springframework.security.config.http.SessionCreationPolicy.IF_REQUIRED)
            )
            .httpBasic(httpBasic -> httpBasic.disable())  // Disable HTTP Basic Auth to prevent popup
            .formLogin(form -> form.disable());  // Disable form login
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder auth = http.getSharedObject(AuthenticationManagerBuilder.class);
        auth.userDetailsService(userDetailsService()).passwordEncoder(passwordEncoder());
        return auth.build();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails admin = User.builder()
            .username("admin")
            .password(passwordEncoder().encode("admin123"))
            .roles("ADMIN")
            .build();

        UserDetails user = User.builder()
            .username("user")
            .password(passwordEncoder().encode("user123"))
            .roles("EMPLOYEE")
            .build();

        UserDetails helpdeskAdmin = User.builder()
            .username("helpdesk-admin")
            .password(passwordEncoder().encode("helpdesk123"))
            .roles("ADMIN")
            .build();

        // Add database users for testing different roles
        UserDetails johnDoe = User.builder()
            .username("john.doe")
            .password(passwordEncoder().encode("password123"))
            .roles("TECHNICIAN")
            .build();

        UserDetails janeSmith = User.builder()
            .username("jane.smith")
            .password(passwordEncoder().encode("password123"))
            .roles("TECHNICIAN")
            .build();

        UserDetails aliceFinance = User.builder()
            .username("alice.finance")
            .password(passwordEncoder().encode("password123"))
            .roles("EMPLOYEE")
            .build();

        UserDetails bobHr = User.builder()
            .username("bob.hr")
            .password(passwordEncoder().encode("password123"))
            .roles("EMPLOYEE")
            .build();

        return new InMemoryUserDetailsManager(admin, user, helpdeskAdmin, johnDoe, janeSmith, aliceFinance, bobHr);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:3000", 
            "http://localhost:4200", 
            "http://localhost:*",
            "https://localhost:*",
            "http://*.azurecontainer.io",
            "https://*.azurecontainer.io",
            "https://*.azurecontainerapps.io",
            "https://*.azurewebsites.net",
            "https://*.azure.com",
            "https://*.cloudapp.azure.com",
            "http://20.124.43.230",
            "http://20.124.43.230:80",
            "file://*",
            "null"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true); // Enable credentials for session cookies
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
} 
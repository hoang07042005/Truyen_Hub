package com.example.novel_website_schema.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("OPTIONS", "/**").permitAll() // Allow all OPTIONS requests for CORS preflight
                .requestMatchers("/api/admin/**").authenticated() // Admin endpoints require authentication
                .requestMatchers("/api/users/me").authenticated()
                .requestMatchers("/api/auth/change-password").authenticated()
                .requestMatchers("/api/ratings/story/*/user").authenticated()
                .requestMatchers("/api/ratings/story/*").permitAll() // GET ratings list
                .requestMatchers("/api/ratings/**").authenticated()
                .requestMatchers("/api/likes/**").authenticated()
                .requestMatchers("/api/stories/**").permitAll()
                .requestMatchers("/api/chapters/admin/**").authenticated() // Admin chapter endpoints require authentication
                .requestMatchers("/api/chapters/**").permitAll()
                .requestMatchers("/api/categories/admin/**").authenticated() // Admin category endpoints require authentication
                .anyRequest().permitAll()
            );
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
} 
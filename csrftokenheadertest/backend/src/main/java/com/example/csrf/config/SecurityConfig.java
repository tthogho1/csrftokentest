package com.example.csrf.config;

import com.example.csrf.filter.CsrfTokenResponseHeaderFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public HttpSessionCsrfTokenRepository csrfTokenRepository() {
        HttpSessionCsrfTokenRepository repo = new HttpSessionCsrfTokenRepository();
        repo.setHeaderName("X-CSRF-TOKEN");
        return repo;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           HttpSessionCsrfTokenRepository tokenRepository) throws Exception {
        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(tokenRepository)
            )
            .authorizeHttpRequests(authz -> authz
                .anyRequest().permitAll()
            )
            // Expose the CSRF token in the X-CSRF-TOKEN response header (EARS-002)
            .addFilterAfter(new CsrfTokenResponseHeaderFilter(tokenRepository), CsrfFilter.class);

        return http.build();
    }

    // CORS handling removed for testing: server will not add CORS response headers
}

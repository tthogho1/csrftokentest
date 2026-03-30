package com.example.csrf.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.function.Supplier;

/**
 * Runs after Spring Security's CsrfFilter and writes the current CSRF token
 * into the X-CSRF-TOKEN response header (EARS-002).
 *
 * In Spring Security 6, CsrfTokenRequestAttributeHandler stores a Supplier<CsrfToken>
 * as the request attribute. Calling supplier.get() triggers the deferred load/generation
 * so the token is always present in the session before we expose it.
 */
public class CsrfTokenResponseHeaderFilter extends OncePerRequestFilter {

    private final HttpSessionCsrfTokenRepository tokenRepository;

    public CsrfTokenResponseHeaderFilter(HttpSessionCsrfTokenRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        // Resolve the CSRF token from the request attribute set by CsrfFilter
        Object attr = request.getAttribute(CsrfToken.class.getName());
        CsrfToken csrfToken = null;

        if (attr instanceof CsrfToken direct) {
            csrfToken = direct;
        } else if (attr instanceof Supplier<?> supplier) {
            // Spring Security 6 deferred token — calling get() loads or generates the token
            Object resolved = supplier.get();
            if (resolved instanceof CsrfToken token) {
                csrfToken = token;
            }
        }

        // Fallback: load directly from repository (handles first-time session creation)
        if (csrfToken == null) {
            csrfToken = tokenRepository.loadToken(request);
        }
        if (csrfToken == null) {
            csrfToken = tokenRepository.generateToken(request);
            tokenRepository.saveToken(csrfToken, request, response);
        }

        response.setHeader(csrfToken.getHeaderName(), csrfToken.getToken());
        chain.doFilter(request, response);
    }
}

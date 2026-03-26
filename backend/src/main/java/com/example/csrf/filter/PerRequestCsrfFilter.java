package com.example.csrf.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Per-request CSRF filter (独自実装).
 *
 * For every request:
 *   1. If the request is a non-safe method (POST/PUT/DELETE/PATCH), validate the incoming
 *      X-CSRF-TOKEN header against the token stored in the session from the PREVIOUS request.
 *      Return 403 if validation fails (EARS-007).
 *   2. Generate a new UUID token and store it in the session (EARS-004).
 *   3. Set the token as a request attribute so controllers can read it.
 *   4. Expose the new token via the X-CSRF-TOKEN response header so the Axios
 *      response interceptor can cache it client-side.
 *   5. Continue the filter chain (EARS-004).
 */
public class PerRequestCsrfFilter extends OncePerRequestFilter {

    private static final String SESSION_ATTR = "_csrf_token";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // For non-GET requests: validate BEFORE generating new token (EARS-007)
        if (!isSafeMethod(request.getMethod())) {
            HttpSession session = request.getSession(false);
            String sessionToken = session != null ? (String) session.getAttribute(SESSION_ATTR) : null;
            String headerToken = request.getHeader("X-CSRF-TOKEN");

            if (sessionToken == null || !sessionToken.equals(headerToken)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"error\": \"Invalid CSRF token\"}");
                return;
            }
        }

        // Generate new token for this request (EARS-004)
        String newToken = UUID.randomUUID().toString();
        HttpSession session = request.getSession(true);
        session.setAttribute(SESSION_ATTR, newToken);       // step 2: store in session
        request.setAttribute(SESSION_ATTR, newToken);       // step 3: set as request attribute
        response.setHeader("X-CSRF-TOKEN", newToken);       // expose for Axios response interceptor

        filterChain.doFilter(request, response);            // step 4: continue filter chain
    }

    private boolean isSafeMethod(String method) {
        return "GET".equalsIgnoreCase(method) ||
               "HEAD".equalsIgnoreCase(method) ||
               "OPTIONS".equalsIgnoreCase(method);
    }
}

package com.example.csrf.controller;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Endpoints used by the Vue frontend and E2E tests.
 *
 * GET  /api/secure/data — safe method; triggers CSRF token generation and returns it
 *                          in the X-CSRF-TOKEN response header via CsrfTokenResponseHeaderFilter.
 * POST /api/secure/data — state-changing; validated by Spring Security CsrfFilter (EARS-005/006/007).
 * PUT  /api/secure/data — same CSRF enforcement (EARS-007 Outline).
 * DELETE /api/secure/data — same CSRF enforcement (EARS-007 Outline).
 * PATCH /api/secure/data — same CSRF enforcement (EARS-007 Outline).
 */
@RestController
@RequestMapping("/api/secure")
public class SecureDataController {

    @GetMapping("/data")
    public Map<String, String> getData() {
        return Map.of("status", "ok", "message", "Data retrieved successfully");
    }

    @PostMapping("/data")
    public Map<String, String> postData(@RequestBody(required = false) Map<String, Object> body) {
        return Map.of("status", "ok", "message", "Data saved successfully");
    }

    @PutMapping("/data")
    public Map<String, String> putData(@RequestBody(required = false) Map<String, Object> body) {
        return Map.of("status", "ok", "message", "Data updated successfully");
    }

    @DeleteMapping("/data")
    public Map<String, String> deleteData() {
        return Map.of("status", "ok", "message", "Data deleted successfully");
    }

    @PatchMapping("/data")
    public Map<String, String> patchData(@RequestBody(required = false) Map<String, Object> body) {
        return Map.of("status", "ok", "message", "Data patched successfully");
    }
}

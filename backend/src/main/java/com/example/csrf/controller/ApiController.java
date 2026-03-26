package com.example.csrf.controller;

import com.example.csrf.dto.SubmitRequest;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Handles the two-step form submission flow (EARS-005, EARS-006).
 *
 * Both endpoints require a valid X-CSRF-TOKEN header; validation is handled
 * transparently by PerRequestCsrfFilter before the request reaches these methods.
 */
@RestController
@RequestMapping("/api")
public class ApiController {

    /**
     * Receives the input-form submission and returns the data for the confirmation screen.
     * EARS-005: POST /api/submit with X-CSRF-TOKEN header.
     */
    @PostMapping("/submit")
    public Map<String, String> submit(@RequestBody SubmitRequest req) {
        return Map.of(
            "status", "確認画面へ",
            "name", req.getName(),
            "birthdate", req.getBirthdate()
        );
    }

    /**
     * Finalises the registration after the user confirms on the confirmation screen.
     * EARS-006: POST /api/confirm with X-CSRF-TOKEN header.
     */
    @PostMapping("/confirm")
    public Map<String, String> confirm(@RequestBody SubmitRequest req) {
        return Map.of(
            "status", "完了",
            "message", "登録完了"
        );
    }
}

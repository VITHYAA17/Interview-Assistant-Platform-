package com.prepwise.controller;

import com.prepwise.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final GeminiService geminiService;

    public HealthController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> checkHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "PrepWise Spring Boot Backend",
                "timestamp", Instant.now().toString(),
                "geminiConfigured", geminiService.isConfigured()
        ));
    }
}

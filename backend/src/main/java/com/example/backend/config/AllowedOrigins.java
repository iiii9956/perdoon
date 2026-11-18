package com.example.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class AllowedOrigins {

    private final List<String> origins;

    public AllowedOrigins(
            @Value("${app.cors.allowed-origins:http://localhost:5173}") String rawOrigins
    ) {
        this.origins = Arrays.stream(rawOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toList();
    }

    public List<String> getOrigins() {
        return origins;
    }
}

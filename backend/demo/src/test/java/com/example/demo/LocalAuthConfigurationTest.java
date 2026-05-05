package com.example.demo;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.StringReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LocalAuthConfigurationTest {

    @Test
    void frontendApiBaseUrlMatchesBackendServerPort() throws IOException {
        Properties properties = new Properties();
        properties.load(new StringReader(Files.readString(Path.of("src/main/resources/application.properties"))));

        String backendPort = properties.getProperty("server.port", "8080").trim();
        String frontendApi = Files.readString(Path.of("../../frontend/src/lib/api.ts").normalize());
        Matcher matcher = Pattern.compile("API_BASE_URL\\s*=\\s*\"http://localhost:(\\d+)\"").matcher(frontendApi);

        assertTrue(matcher.find(), "frontend API_BASE_URL should point at localhost with an explicit port");
        assertEquals(backendPort, matcher.group(1),
                "frontend API_BASE_URL port must match backend server.port or browser fetch calls will fail");
    }
}

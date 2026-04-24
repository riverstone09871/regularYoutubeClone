package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.service.AuthService;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/me")
    public User getUser(@AuthenticationPrincipal OAuth2User user, HttpSession session) {
        return authService.getCurrentUser(session, user);
    }

    @PostMapping("/register")
    public User register(@RequestBody Map<String, String> body, HttpSession session) {
        return authService.register(body, session);
    }

    @PostMapping("/login")
    public User login(@RequestBody Map<String, String> body, HttpSession session) {
        return authService.login(body, session);
    }

    @PostMapping("/logout")
    public void logout(HttpSession session) {
        authService.logout(session);
    }
}

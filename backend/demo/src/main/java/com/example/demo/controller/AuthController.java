package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
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
    public User register(@RequestBody Map<String, String> body, HttpSession session, HttpServletResponse response) {
        User user = authService.register(body, session);
        attachSessionCookie(session, response);
        return user;
    }

    @PostMapping("/login")
    public User login(@RequestBody Map<String, String> body, HttpSession session, HttpServletResponse response) {
        User user = authService.login(body, session);
        attachSessionCookie(session, response);
        return user;
    }

    @PostMapping("/logout")
    public void logout(HttpSession session, HttpServletResponse response) {
        authService.logout(session);
        clearSessionCookie(response);
    }

    private void attachSessionCookie(HttpSession session, HttpServletResponse response) {
        Cookie cookie = new Cookie("JSESSIONID", session.getId());
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(-1);
        response.addCookie(cookie);
        response.setHeader("X-Session-Id", session.getId());
    }

    private void clearSessionCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("JSESSIONID", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}

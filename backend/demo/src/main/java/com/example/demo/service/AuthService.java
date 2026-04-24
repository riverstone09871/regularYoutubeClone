package com.example.demo.service;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    public static final String SESSION_USER_ID = "userId";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(Map<String, String> body, HttpSession session) {
        String name = required(body, "name");
        String email = required(body, "email").toLowerCase();
        String password = required(body, "password");

        userRepository.findByEmail(email).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        });

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPicture("https://ui-avatars.com/api/?name=" + name.replace(" ", "+") + "&background=ff0000&color=fff");
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setAuthProvider("local");

        User saved = userRepository.save(user);
        session.setAttribute(SESSION_USER_ID, saved.getId());
        return saved;
    }

    public User login(Map<String, String> body, HttpSession session) {
        String email = required(body, "email").toLowerCase();
        String password = required(body, "password");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (user.getPasswordHash() == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        session.setAttribute(SESSION_USER_ID, user.getId());
        return user;
    }

    public void logout(HttpSession session) {
        session.invalidate();
    }

    public User getCurrentUser(HttpSession session, OAuth2User oauthUser) {
        if (oauthUser != null) {
            return syncOAuthUser(oauthUser);
        }

        Object userId = session.getAttribute(SESSION_USER_ID);
        if (userId instanceof Long id) {
            return userRepository.findById(id).orElse(null);
        }
        if (userId instanceof Integer id) {
            return userRepository.findById(id.longValue()).orElse(null);
        }
        return null;
    }

    public User requireCurrentUser(HttpSession session, OAuth2User oauthUser) {
        User user = getCurrentUser(session, oauthUser);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        return user;
    }

    private User syncOAuthUser(OAuth2User oauthUser) {
        String googleId = oauthUser.getAttribute("sub");
        String email = Optional.ofNullable(oauthUser.<String>getAttribute("email")).orElse("").toLowerCase();

        User user = userRepository.findByGoogleId(googleId)
                .or(() -> userRepository.findByEmail(email))
                .orElseGet(User::new);

        user.setGoogleId(googleId);
        user.setName(oauthUser.getAttribute("name"));
        user.setEmail(email);
        user.setPicture(oauthUser.getAttribute("picture"));
        user.setAuthProvider("google");
        return userRepository.save(user);
    }

    private String required(Map<String, String> body, String key) {
        String value = body.get(key);
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, key + " is required");
        }
        return value.trim();
    }
}

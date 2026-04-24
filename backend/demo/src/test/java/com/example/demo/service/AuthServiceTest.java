package com.example.demo.service;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    private HttpSession session;

    @BeforeEach
    void setUp() {
        session = new MockHttpSession();
    }

    @Test
    void registerCreatesUserAndStoresSession() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("secret123")).thenReturn("hashed-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setPasswordHash("hashed-password");
            setUserId(user, 5L);
            return user;
        });

        User saved = authService.register(
                Map.of("name", "Test User", "email", "test@example.com", "password", "secret123"),
                session
        );

        verify(userRepository).save(userCaptor.capture());
        User captured = userCaptor.getValue();

        assertEquals("Test User", captured.getName());
        assertEquals("test@example.com", captured.getEmail());
        assertEquals("hashed-password", captured.getPasswordHash());
        assertEquals("local", captured.getAuthProvider());
        assertEquals(5L, session.getAttribute(AuthService.SESSION_USER_ID));
        assertEquals("test@example.com", saved.getEmail());
    }

    @Test
    void loginStoresUserIdInSessionWhenPasswordMatches() {
        User user = new User();
        user.setEmail("tester@example.com");
        user.setPasswordHash("stored-hash");

        setUserId(user, 9L);

        when(userRepository.findByEmail("tester@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret123", "stored-hash")).thenReturn(true);

        User loggedIn = authService.login(
                Map.of("email", "tester@example.com", "password", "secret123"),
                session
        );

        assertEquals(9L, session.getAttribute(AuthService.SESSION_USER_ID));
        assertEquals("tester@example.com", loggedIn.getEmail());
    }

    @Test
    void loginRejectsInvalidPassword() {
        User user = new User();
        user.setEmail("tester@example.com");
        user.setPasswordHash("stored-hash");

        when(userRepository.findByEmail("tester@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "stored-hash")).thenReturn(false);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                authService.login(Map.of("email", "tester@example.com", "password", "wrong"), session)
        );

        assertEquals(401, exception.getStatusCode().value());
    }

    private void setUserId(User user, long id) {
        try {
            java.lang.reflect.Field idField = User.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(user, id);
        } catch (ReflectiveOperationException exception) {
            throw new RuntimeException(exception);
        }
    }
}

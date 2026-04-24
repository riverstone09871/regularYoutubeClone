package com.example.demo.controller;

import com.example.demo.entity.Subscription;
import com.example.demo.entity.User;
import com.example.demo.service.AuthService;
import com.example.demo.service.SubscriptionService;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subscriptions")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final AuthService authService;

    public SubscriptionController(SubscriptionService subscriptionService, AuthService authService) {
        this.subscriptionService = subscriptionService;
        this.authService = authService;
    }

    @GetMapping
    public Map<String, Object> getSubscriptions(
            @AuthenticationPrincipal OAuth2User oauthUser,
            HttpSession session
    ) {
        User user = authService.requireCurrentUser(session, oauthUser);
        List<Subscription> subscriptions = subscriptionService.getSubscriptions(user);
        List<String> subscribedChannelIds = subscriptions.stream()
                .map(Subscription::getChannelId)
                .toList();

        return Map.of(
                "userId", user.getId(),
                "subscribedChannelIds", subscribedChannelIds
        );
    }

    @PostMapping("/{channelId}")
    public Map<String, Object> toggleSubscription(
            @PathVariable String channelId,
            @AuthenticationPrincipal OAuth2User oauthUser,
            HttpSession session
    ) {
        User user = authService.requireCurrentUser(session, oauthUser);
        boolean subscribed = subscriptionService.toggleSubscription(user, channelId);
        List<String> subscribedChannelIds = subscriptionService.getSubscriptions(user).stream()
                .map(Subscription::getChannelId)
                .toList();

        return Map.of(
                "subscribed", subscribed,
                "userId", user.getId(),
                "subscribedChannelIds", subscribedChannelIds
        );
    }
}

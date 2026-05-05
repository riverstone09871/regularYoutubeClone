package com.example.demo.controller;

import com.example.demo.entity.Comment;
import com.example.demo.entity.Subscription;
import com.example.demo.entity.User;
import com.example.demo.entity.Video;
import com.example.demo.service.AuthService;
import com.example.demo.service.CommentService;
import com.example.demo.service.SubscriptionService;
import com.example.demo.service.VideoService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Controller
public class GraphqlController {

    private final AuthService authService;
    private final VideoService videoService;
    private final CommentService commentService;
    private final SubscriptionService subscriptionService;

    public GraphqlController(
            AuthService authService,
            VideoService videoService,
            CommentService commentService,
            SubscriptionService subscriptionService
    ) {
        this.authService = authService;
        this.videoService = videoService;
        this.commentService = commentService;
        this.subscriptionService = subscriptionService;
    }

    @QueryMapping
    public String health() {
        return "GraphQL backend is running";
    }

    @QueryMapping
    public User me() {
        return authService.getCurrentUser(session(), oauthUser());
    }

    @QueryMapping
    public List<VideoPayload> videos() {
        try {
            return videoService.getVideos().stream()
                    .map(VideoPayload::from)
                    .collect(Collectors.toList());
        } catch (RuntimeException exception) {
            exception.printStackTrace();
            throw exception;
        }
    }

    @QueryMapping
    public List<Comment> comments(@Argument String videoId) {
        return commentService.getComments(videoId);
    }

    @QueryMapping
    public List<Comment> allComments() {
        return commentService.getAllComments();
    }

    @QueryMapping
    public SubscriptionSummary subscriptions() {
        User user = currentUser();
        List<String> subscribedChannelIds = subscriptionService.getSubscriptions(user).stream()
                .map(Subscription::getChannelId)
                .toList();
        return new SubscriptionSummary(user.getId(), subscribedChannelIds);
    }

    @QueryMapping
    public Set<String> subscribedChannels(@Argument Long userId) {
        return subscriptionService.getSubscribedChannelNames(userId);
    }

    @MutationMapping
    public User register(@Argument String name, @Argument String email, @Argument String password) {
        User user = authService.register(Map.of(
                "name", name,
                "email", email,
                "password", password
        ), session());
        attachSessionCookie();
        return user;
    }

    @MutationMapping
    public User login(@Argument String email, @Argument String password) {
        User user = authService.login(Map.of(
                "email", email,
                "password", password
        ), session());
        attachSessionCookie();
        return user;
    }

    @MutationMapping
    public boolean logout() {
        authService.logout(session());
        clearSessionCookie();
        return true;
    }

    @MutationMapping
    public Video createVideo(
            @Argument String title,
            @Argument String description,
            @Argument String thumbnailUrl
    ) {
        return videoService.createVideo(Map.of(
                "title", title,
                "description", description,
                "thumbnailUrl", thumbnailUrl == null ? "" : thumbnailUrl
        ), currentUser());
    }

    @MutationMapping
    public Comment addComment(
            @Argument String videoId,
            @Argument String text,
            @Argument Long parentCommentId,
            @Argument String idempotencyKey
    ) {
        return commentService.addComment(videoId, text, parentCommentId, currentUser(), idempotencyKey);
    }

    @MutationMapping
    public Comment replyToComment(
            @Argument Long commentId,
            @Argument String videoId,
            @Argument String text
    ) {
        return commentService.addComment(videoId, text, commentId, currentUser());
    }

    @MutationMapping
    public Comment likeComment(@Argument Long commentId) {
        return commentService.likeComment(commentId);
    }

    @MutationMapping
    public Comment dislikeComment(@Argument Long commentId) {
        return commentService.dislikeComment(commentId);
    }

    @MutationMapping
    public ToggleSubscriptionPayload toggleSubscription(@Argument String channelId) {
        User user = currentUser();
        boolean subscribed = subscriptionService.toggleSubscription(user, channelId);
        List<String> subscribedChannelIds = subscriptionService.getSubscriptions(user).stream()
                .map(Subscription::getChannelId)
                .toList();
        return new ToggleSubscriptionPayload(subscribed, user.getId(), subscribedChannelIds);
    }

    private User currentUser() {
        return authService.requireCurrentUser(session(), oauthUser());
    }

    private OAuth2User oauthUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof OAuth2AuthenticationToken token) {
            return token.getPrincipal();
        }
        return null;
    }

    private HttpSession session() {
        return request().getSession();
    }

    private HttpServletRequest request() {
        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
        return attributes.getRequest();
    }

    private HttpServletResponse response() {
        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
        return attributes.getResponse();
    }

    private void attachSessionCookie() {
        HttpServletResponse response = response();
        if (response == null) {
            return;
        }

        HttpSession session = session();
        Cookie cookie = new Cookie("JSESSIONID", session.getId());
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(-1);
        response.addCookie(cookie);
        response.setHeader("X-Session-Id", session.getId());
    }

    private void clearSessionCookie() {
        HttpServletResponse response = response();
        if (response == null) {
            return;
        }

        Cookie cookie = new Cookie("JSESSIONID", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    public record SubscriptionSummary(Long userId, List<String> subscribedChannelIds) {
    }

    public record ToggleSubscriptionPayload(boolean subscribed, Long userId, List<String> subscribedChannelIds) {
    }

    public record UserPayload(Long id, String googleId, String email, String name, String picture, String authProvider) {
        static UserPayload from(User user) {
            if (user == null) {
                return null;
            }
            return new UserPayload(
                    user.getId(),
                    user.getGoogleId(),
                    user.getEmail(),
                    user.getName(),
                    user.getPicture(),
                    user.getAuthProvider()
            );
        }
    }

    public record VideoPayload(
            Long id,
            String title,
            String description,
            String thumbnailUrl,
            String channelName,
            String createdAt,
            UserPayload user
    ) {
        static VideoPayload from(Video video) {
            return new VideoPayload(
                    video.getId(),
                    video.getTitle(),
                    video.getDescription(),
                    video.getThumbnailUrl(),
                    video.getChannelName(),
                    video.getCreatedAt() == null ? null : video.getCreatedAt().toString(),
                    UserPayload.from(video.getUser())
            );
        }
    }
}

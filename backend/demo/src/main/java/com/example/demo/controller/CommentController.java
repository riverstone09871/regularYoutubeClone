package com.example.demo.controller;

import com.example.demo.entity.Comment;
import com.example.demo.entity.User;
import com.example.demo.service.AuthService;
import com.example.demo.service.CommentService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class CommentController {

    private final CommentService service;
    private final AuthService authService;

    public CommentController(CommentService service, AuthService authService) {
        this.service = service;
        this.authService = authService;
    }

    @GetMapping("/{videoId}")
    public List<Comment> getComments(@PathVariable String videoId) {
        return service.getComments(videoId);
    }

    @GetMapping
    public List<Comment> getAllComments() {
        return service.getAllComments();
    }

    @PostMapping
    public Comment addComment(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal OAuth2User oauthUser,
            HttpSession session
    ) {
        User user = authService.requireCurrentUser(session, oauthUser);

        Long parentCommentId = body.get("parentCommentId") == null || body.get("parentCommentId").isBlank()
                ? null
                : Long.parseLong(body.get("parentCommentId"));

        return service.addComment(body.get("videoId"), body.get("text"), parentCommentId, user);
    }

    @PostMapping("/{commentId}/reply")
    public Comment replyToComment(
            @PathVariable Long commentId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal OAuth2User oauthUser,
            HttpSession session
    ) {
        User user = authService.requireCurrentUser(session, oauthUser);
        return service.addComment(body.get("videoId"), body.get("text"), commentId, user);
    }

    @PostMapping("/{commentId}/like")
    public Comment likeComment(@PathVariable Long commentId) {
        return service.likeComment(commentId);
    }

    @PostMapping("/{commentId}/dislike")
    public Comment dislikeComment(@PathVariable Long commentId) {
        return service.dislikeComment(commentId);
    }
}

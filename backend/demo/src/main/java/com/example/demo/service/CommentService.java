package com.example.demo.service;

import com.example.demo.entity.Comment;
import com.example.demo.entity.User;
import com.example.demo.repository.CommentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepo;

    public CommentService(CommentRepository commentRepo) {
        this.commentRepo = commentRepo;
    }

    public List<Comment> getComments(String videoId) {
        return commentRepo.findByVideoIdOrderByCreatedAtDesc(videoId);
    }

    public Comment addComment(String videoId, String text, Long parentCommentId, User user) {
        return addComment(videoId, text, parentCommentId, user, null);
    }

    public Comment addComment(String videoId, String text, Long parentCommentId, User user, String idempotencyKey) {
        if (text == null || text.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "text is required");
        }

        String normalizedKey = normalizeIdempotencyKey(idempotencyKey);
        if (normalizedKey != null && user.getId() != null) {
            Comment existing = commentRepo.findByUserIdAndIdempotencyKey(user.getId(), normalizedKey).orElse(null);
            if (existing != null) {
                return existing;
            }
        }

        Comment c = new Comment();
        c.setVideoId(videoId);
        c.setText(text.trim());
        c.setCreatedAt(LocalDateTime.now());
        c.setParentCommentId(parentCommentId);
        c.setIdempotencyKey(normalizedKey);
        c.setLikes(0);
        c.setDislikes(0);
        c.setUser(user);
        return commentRepo.save(c);
    }

    public List<Comment> getAllComments() {
        return commentRepo.findAll();
    }

    public Comment likeComment(Long commentId) {
        Comment comment = getComment(commentId);
        comment.setLikes(comment.getLikes() + 1);
        return commentRepo.save(comment);
    }

    public Comment dislikeComment(Long commentId) {
        Comment comment = getComment(commentId);
        comment.setDislikes(comment.getDislikes() + 1);
        return commentRepo.save(comment);
    }

    private Comment getComment(Long commentId) {
        return commentRepo.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
    }

    private String normalizeIdempotencyKey(String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return null;
        }
        return idempotencyKey.trim();
    }
}

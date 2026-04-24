package com.example.demo.service;

import com.example.demo.entity.Comment;
import com.example.demo.entity.User;
import com.example.demo.repository.CommentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;sss

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;

    @InjectMocks
    private CommentService commentService;

    @Captor
    private ArgumentCaptor<Comment> commentCaptor;

    @Test
    void addCommentCreatesReplyWithZeroedReactions() {
        User user = new User();
        user.setName("Comment Author");

        when(commentRepository.save(any(Comment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Comment saved = commentService.addComment("video-1", "Nice video", 12L, user);

        verify(commentRepository).save(commentCaptor.capture());
        Comment captured = commentCaptor.getValue();

        assertEquals("video-1", captured.getVideoId());
        assertEquals("Nice video", captured.getText());
        assertEquals(12L, captured.getParentCommentId());
        assertEquals(0, captured.getLikes());
        assertEquals(0, captured.getDislikes());
        assertEquals(user, captured.getUser());
        assertNotNull(captured.getCreatedAt());
        assertEquals("Nice video", saved.getText());
    }

    @Test
    void likeAndDislikeIncrementCounts() {
        Comment comment = new Comment();
        comment.setLikes(1);
        comment.setDislikes(2);

        when(commentRepository.findById(5L)).thenReturn(Optional.of(comment));
        when(commentRepository.save(any(Comment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Comment liked = commentService.likeComment(5L);
        Comment disliked = commentService.dislikeComment(5L);

        assertEquals(2, liked.getLikes());
        assertEquals(3, disliked.getDislikes());
    }

    @Test
    void addCommentRejectsBlankText() {
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                commentService.addComment("video-1", "   ", null, new User())
        );

        assertEquals(400, exception.getStatusCode().value());
    }
}

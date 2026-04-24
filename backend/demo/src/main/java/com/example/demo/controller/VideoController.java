package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.entity.Video;
import com.example.demo.service.AuthService;
import com.example.demo.service.VideoService;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/videos")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class VideoController {

    private final VideoService videoService;
    private final AuthService authService;

    public VideoController(VideoService videoService, AuthService authService) {
        this.videoService = videoService;
        this.authService = authService;
    }

    @GetMapping
    public List<Video> getVideos() {
        return videoService.getVideos();
    }

    @PostMapping
    public Video createVideo(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal OAuth2User oauthUser,
            HttpSession session
    ) {
        User user = authService.requireCurrentUser(session, oauthUser);
        return videoService.createVideo(body, user);
    }
}

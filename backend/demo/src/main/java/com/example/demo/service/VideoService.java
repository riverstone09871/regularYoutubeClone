package com.example.demo.service;

import com.example.demo.entity.User;
import com.example.demo.entity.Video;
import com.example.demo.repository.VideoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class VideoService {

    private final VideoRepository videoRepository;

    public VideoService(VideoRepository videoRepository) {
        this.videoRepository = videoRepository;
    }

    public List<Video> getVideos() {
        return videoRepository.findAllByOrderByCreatedAtDesc();
    }

    public Video createVideo(Map<String, String> body, User user) {
        String title = required(body, "title");
        String description = required(body, "description");
        String thumbnailUrl = body.getOrDefault("thumbnailUrl", "").trim();

        Video video = new Video();
        video.setTitle(title);
        video.setDescription(description);
        video.setThumbnailUrl(thumbnailUrl.isBlank() ? "/fallback-thumbnail.svg" : thumbnailUrl);
        video.setCreatedAt(LocalDateTime.now());
        video.setChannelName(user.getName());
        video.setUser(user);
        return videoRepository.save(video);
    }

    private String required(Map<String, String> body, String key) {
        String value = body.get(key);
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, key + " is required");
        }
        return value.trim();
    }
}

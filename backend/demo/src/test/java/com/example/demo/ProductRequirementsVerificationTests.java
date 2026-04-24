package com.example.demo;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertTrue;

class ProductRequirementsVerificationTests {

    private static final Path PROJECT_ROOT = Path.of("").toAbsolutePath();
    private static final Path MAIN_JAVA = PROJECT_ROOT.resolve("src/main/java/com/example/demo");
    private static final Path RESOURCES = PROJECT_ROOT.resolve("src/main/resources");

    private String read(Path path) throws IOException {
        return Files.readString(path);
    }

    private void assertFileExists(String relativePath) {
        Path path = MAIN_JAVA.resolve(relativePath);
        assertTrue(Files.exists(path), "Expected file to exist: " + path);
    }

    @Test
    void authSystemSupportsRegisterAndLoginFlows() throws IOException {
        String authController = read(MAIN_JAVA.resolve("controller/AuthController.java"));
        String userEntity = read(MAIN_JAVA.resolve("entity/User.java"));

        assertTrue(authController.contains("/register"),
                "AuthController should expose a /register endpoint");
        assertTrue(authController.contains("/login"),
                "AuthController should expose a /login endpoint");
        assertTrue(userEntity.toLowerCase().contains("password"),
                "User entity should persist a password field for email/password auth");
    }

    @Test
    void subscriptionsFeatureHasDedicatedBackendLayer() throws IOException {
        assertFileExists("controller/SubscriptionController.java");
        assertFileExists("service/SubscriptionService.java");
        assertFileExists("repository/SubscriptionRepository.java");
        assertFileExists("entity/Subscription.java");

        String subscriptionEntity = read(MAIN_JAVA.resolve("entity/Subscription.java"));
        assertTrue(subscriptionEntity.contains("userId") || subscriptionEntity.contains("User user"),
                "Subscription entity should connect subscriptions to a user");
        assertTrue(subscriptionEntity.contains("subscribedChannelIds")
                        || subscriptionEntity.contains("channelId")
                        || subscriptionEntity.contains("Channel"),
                "Subscription entity should persist subscribed channels");
    }

    @Test
    void commentsSupportRepliesAndReactions() throws IOException {
        String commentEntity = read(MAIN_JAVA.resolve("entity/Comment.java"));
        String commentController = read(MAIN_JAVA.resolve("controller/CommentController.java"));

        assertTrue(commentEntity.contains("parentCommentId")
                        || commentEntity.contains("parentComment"),
                "Comment entity should support nested replies");
        assertTrue(commentEntity.contains("likes"),
                "Comment entity should track likes");
        assertTrue(commentEntity.contains("dislikes"),
                "Comment entity should track dislikes");
        assertTrue(commentController.toLowerCase().contains("reply"),
                "CommentController should expose reply functionality");
        assertTrue(commentController.toLowerCase().contains("like")
                        || commentController.toLowerCase().contains("reaction"),
                "CommentController should expose comment reaction functionality");
    }

    @Test
    void videoCreationApiExists() throws IOException {
        assertFileExists("controller/VideoController.java");
        assertFileExists("service/VideoService.java");
        assertFileExists("repository/VideoRepository.java");
        assertFileExists("entity/Video.java");

        String videoEntity = read(MAIN_JAVA.resolve("entity/Video.java"));
        String videoController = read(MAIN_JAVA.resolve("controller/VideoController.java"));

        assertTrue(videoEntity.contains("title"), "Video entity should include a title");
        assertTrue(videoEntity.contains("description"), "Video entity should include a description");
        assertTrue(videoEntity.contains("thumbnailUrl")
                        || videoEntity.contains("thumbnail"),
                "Video entity should include a thumbnail URL");
        assertTrue(videoController.contains("@PostMapping"),
                "VideoController should expose a create endpoint");
    }

    @Test
    void trackedConfigUsesEnvironmentPlaceholdersForSecrets() throws IOException {
        String applicationProperties = read(RESOURCES.resolve("application.properties"));

        assertTrue(applicationProperties.contains("spring.config.import=optional:file:.env[.properties]"),
                "application.properties should import a local .env file for private values");
        assertTrue(applicationProperties.contains("${GOOGLE_CLIENT_ID"),
                "application.properties should read the Google client id from an environment variable");
        assertTrue(applicationProperties.contains("${GOOGLE_CLIENT_SECRET"),
                "application.properties should read the Google client secret from an environment variable");
        assertTrue(applicationProperties.contains("${DB_PASSWORD"),
                "application.properties should read the database password from an environment variable");
        assertTrue(!applicationProperties.contains("GOCSPX-"),
                "application.properties must not contain a real Google client secret");
        assertTrue(!applicationProperties.contains("mypassword"),
                "application.properties must not contain a real database password");
    }
}

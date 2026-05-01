package com.example.demo.service;

import com.example.demo.entity.Subscription;
import com.example.demo.entity.User;
import com.example.demo.repository.SubscriptionRepository;
import com.example.demo.repository.VideoRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Set;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final VideoRepository videoRepository;
    public SubscriptionService(SubscriptionRepository subscriptionRepository, VideoRepository videoRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.videoRepository = videoRepository;
    }

    public List<Subscription> getSubscriptions(User user) {
        return subscriptionRepository.findByUserOrderByChannelIdAsc(user);
    }

    public boolean toggleSubscription(User user, String channelId) {
        return subscriptionRepository.findByUserAndChannelId(user, channelId)
                .map(subscription -> {
                    subscriptionRepository.delete(subscription);
                    return false;
                })
                .orElseGet(() -> {
                    Subscription subscription = new Subscription();
                    subscription.setUser(user);
                    subscription.setChannelId(channelId);
                    subscriptionRepository.save(subscription);
                    return true;
                });
    }
    public Set<String> getSubscribedChannelNames(Long userId) {
        return subscriptionRepository.findByUserId(userId).stream()
            .map(Subscription::getChannelId)
            .collect(Collectors.toSet());
    }
}

package com.example.demo.service;

import com.example.demo.entity.Subscription;
import com.example.demo.entity.User;
import com.example.demo.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;

    public SubscriptionService(SubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
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
}

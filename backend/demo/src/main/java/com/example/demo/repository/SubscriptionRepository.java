package com.example.demo.repository;

import com.example.demo.entity.Subscription;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findByUserOrderByChannelIdAsc(User user);
    Optional<Subscription> findByUserAndChannelId(User user, String channelId);
}

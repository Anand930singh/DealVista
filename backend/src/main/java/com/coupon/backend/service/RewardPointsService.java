package com.coupon.backend.service;

import com.coupon.backend.entity.UserDetail;
import com.coupon.backend.repository.UserDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RewardPointsService {

    @Autowired
    private UserDetailRepository userDetailRepository;

    public void addPointsByEmail(String email, int pointsToAdd) {
        UserDetail user = userDetailRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int currentPoints = user.getPoints() != null ? user.getPoints() : 0;
        user.setPoints(currentPoints + pointsToAdd);
        userDetailRepository.save(user);
    }

    public void deductPointsByEmail(String email, int pointsToDeduct) {
        UserDetail user = userDetailRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int currentPoints = user.getPoints() != null ? user.getPoints() : 0;
        if (currentPoints < pointsToDeduct) {
            throw new RuntimeException("Insufficient reward points");
        }
        user.setPoints(currentPoints - pointsToDeduct);
        userDetailRepository.save(user);
    }
}

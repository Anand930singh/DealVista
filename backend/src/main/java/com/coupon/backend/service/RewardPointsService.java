package com.coupon.backend.service;

import com.coupon.backend.entity.UserDetail;
import com.coupon.backend.repository.UserDetailRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class RewardPointsService {

    private static final Logger logger = LoggerFactory.getLogger(RewardPointsService.class);

    @Autowired
    private UserDetailRepository userDetailRepository;

    @Autowired
    private LogHistoryService logHistoryService;

    public void addPointsById(UUID id, int pointsToAdd) {
        logger.debug("[REWARDS] Adding {} points to user ID: {}", pointsToAdd, id);
        
        UserDetail user = userDetailRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("[REWARDS] User not found - ID: {}", id);
                    return new RuntimeException("Account not found. Please sign in again.");
                });
        
        int currentPoints = user.getPoints() != null ? user.getPoints() : 0;
        int newPoints = currentPoints + pointsToAdd;
        
        logger.debug("[REWARDS] User: {} - Current points: {}, Adding: {}, New total: {}",
            user.getEmail(), currentPoints, pointsToAdd, newPoints);
        
        user.setPoints(newPoints);
        userDetailRepository.save(user);
        
        logger.info("[REWARDS] Points added successfully - User: {}, New balance: {}",
            user.getEmail(), newPoints);
        
        // Log user activity
        logHistoryService.createLog("Earned " + pointsToAdd + " reward points (Balance: " + newPoints + ")", id);
    }

    public void deductPointsById(UUID id, int pointsToDeduct) {
        logger.debug("[REWARDS] Deducting {} points from user ID: {}", pointsToDeduct, id);
        
        UserDetail user = userDetailRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("[REWARDS] User not found - ID: {}", id);
                    return new RuntimeException("Account not found. Please sign in again.");
                });
        
        int currentPoints = user.getPoints() != null ? user.getPoints() : 0;
        
        logger.debug("[REWARDS] User: {} - Current points: {}, Deducting: {}",
            user.getEmail(), currentPoints, pointsToDeduct);
        
        if (currentPoints < pointsToDeduct) {
            logger.warn("[REWARDS] Insufficient points - User: {}, Has: {}, Needs: {}",
                user.getEmail(), currentPoints, pointsToDeduct);
            throw new RuntimeException("Not enough points. You need " + pointsToDeduct + " points but have " + currentPoints + ".");
        }
        
        int newPoints = currentPoints - pointsToDeduct;
        user.setPoints(newPoints);
        userDetailRepository.save(user);
        
        logger.info("[REWARDS] Points deducted successfully - User: {}, New balance: {}",
            user.getEmail(), newPoints);
        
        // Log user activity
        logHistoryService.createLog("Viewed coupon code - Deducted " + pointsToDeduct + " points (Balance: " + newPoints + ")", id);
    }
}

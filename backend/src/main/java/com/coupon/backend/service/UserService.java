package com.coupon.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.coupon.backend.entity.UserDetail;
import com.coupon.backend.repository.UserDetailRepository;

import java.util.UUID;

@Service
public class UserService {
    @Autowired
    private UserDetailRepository userDetailRepository;

    public Integer getUserPoints(UUID userId) {
        UserDetail user = userDetailRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return user.getPoints() != null ? user.getPoints() : 0;
    }
}

package com.coupon.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.coupon.backend.dto.*;
import com.coupon.backend.entity.Coupon;
import com.coupon.backend.entity.CouponRedemption;
import com.coupon.backend.entity.UserDetail;
import com.coupon.backend.repository.CouponRedemptionRepository;
import com.coupon.backend.repository.CouponRepository;
import com.coupon.backend.repository.UserDetailRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {
    @Autowired
    private UserDetailRepository userDetailRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private CouponRedemptionRepository redemptionRepository;

    public Integer getUserPoints(UUID userId) {
        UserDetail user = userDetailRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return user.getPoints() != null ? user.getPoints() : 0;
    }

    public UserProfileDto getUserProfile(UUID userId) {
        UserDetail user = userDetailRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return new UserProfileDto(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getRole(),
            user.getPoints() != null ? user.getPoints() : 0,
            user.getCreatedAt()
        );
    }

    public UserStatsDto getUserStats(UUID userId) {
        // Get user details for totals
        UserDetail user = userDetailRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Use count methods instead of loading full lists
        long couponsAddedCount = couponRepository.countByListedByUserId(userId);
        long couponsRedeemedCount = redemptionRepository.countByUserId(userId);
        
        // Get totals from user entity (no calculation needed)
        int totalPointsEarned = user.getTotalPointsEarned() != null ? user.getTotalPointsEarned() : 0;
        int totalPointsSpent = user.getTotalPointsSpent() != null ? user.getTotalPointsSpent() : 0;
        Integer currentPoints = user.getPoints();
        
        return new UserStatsDto(
            (int) couponsAddedCount,
            (int) couponsRedeemedCount,
            currentPoints,
            totalPointsEarned,
            totalPointsSpent
        );
    }

    public List<CouponListItemDto> getCouponsAddedByUser(UUID userId) {
        List<Coupon> coupons = couponRepository.findByListedByUserId(userId);
        
        return coupons.stream()
                .map(c -> new CouponListItemDto(
                    c.getId(),
                    c.getTitle(),
                    c.getCode(),
                    c.getPlatform(),
                    c.getCategory(),
                    c.getValidTill(),
                    c.getIsActive(),
                    c.getSoldQuantity(),
                    c.getTotalQuantity(),
                    c.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    public List<RedeemedCouponDto> getCouponsRedeemedByUser(UUID userId) {
        List<CouponRedemption> redemptions = redemptionRepository.findByUserId(userId);
        
        return redemptions.stream()
                .map(r -> {
                    Coupon coupon = couponRepository.findById(r.getCouponId()).orElse(null);
                    if (coupon != null) {
                        return new RedeemedCouponDto(
                            r.getId(),
                            coupon.getId(),
                            coupon.getTitle(),
                            coupon.getCode(),
                            coupon.getPlatform(),
                            coupon.getCategory(),
                            r.getPointsDeducted(),
                            r.getRedeemedAt()
                        );
                    }
                    return null;
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }
}

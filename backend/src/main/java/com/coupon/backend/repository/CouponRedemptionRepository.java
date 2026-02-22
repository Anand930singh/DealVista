package com.coupon.backend.repository;

import com.coupon.backend.entity.CouponRedemption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.*;

@Repository
public interface CouponRedemptionRepository extends JpaRepository<CouponRedemption, UUID> {
    
    // Find all redemptions by user
    List<CouponRedemption> findByUserId(UUID userId);
    
    // Count redemptions by user
    long countByUserId(UUID userId);
    
    // Check if user has already redeemed this coupon
    Optional<CouponRedemption> findByUserIdAndCouponId(UUID userId, UUID couponId);
    
    // Check if redemption exists
    boolean existsByUserIdAndCouponId(UUID userId, UUID couponId);
}

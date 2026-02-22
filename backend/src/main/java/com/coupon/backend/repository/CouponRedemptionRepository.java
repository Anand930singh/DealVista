package com.coupon.backend.repository;

import com.coupon.backend.entity.CouponRedemption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CouponRedemptionRepository extends JpaRepository<CouponRedemption, UUID> {
    
    // Check if user has already redeemed this coupon
    Optional<CouponRedemption> findByUserIdAndCouponId(UUID userId, UUID couponId);
    
    // Check if redemption exists
    boolean existsByUserIdAndCouponId(UUID userId, UUID couponId);
}

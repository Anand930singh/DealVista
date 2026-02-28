package com.coupon.backend.repository;

import com.coupon.backend.entity.CouponRedemption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.*;

@Repository
public interface CouponRedemptionRepository extends JpaRepository<CouponRedemption, UUID> {
    
    List<CouponRedemption> findByUserId(UUID userId);
    
    long countByUserId(UUID userId);
    
    Optional<CouponRedemption> findByUserIdAndCouponId(UUID userId, UUID couponId);
    
    boolean existsByUserIdAndCouponId(UUID userId, UUID couponId);
    
    long countByRedeemedAtBetween(Instant startDate, Instant endDate);
}

package com.coupon.backend.service;

import com.coupon.backend.entity.Coupon;
import com.coupon.backend.entity.CouponRedemption;
import com.coupon.backend.repository.CouponRedemptionRepository;
import com.coupon.backend.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.UUID;

@Service
public class CouponRedemptionService {

    private static final Logger logger = LoggerFactory.getLogger(CouponRedemptionService.class);

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private CouponRedemptionRepository redemptionRepository;

    @Autowired
    private RewardPointsService rewardPointsService;

    @Autowired
    private LogHistoryService logHistoryService;

    @Transactional
    public void redeemCoupon(UUID couponId, UUID userId) {
        logger.debug("[REDEMPTION] User {} redeeming coupon {}", userId, couponId);

        // Check if already redeemed
        if (redemptionRepository.existsByUserIdAndCouponId(userId, couponId)) {
            throw new RuntimeException("You have already redeemed this coupon");
        }

        // Get coupon
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));

        // Check if active
        if (!coupon.getIsActive()) {
            throw new RuntimeException("This coupon is no longer available");
        }

        // Check availability
        if (coupon.getSoldQuantity() >= coupon.getTotalQuantity()) {
            coupon.setIsActive(false);
            couponRepository.save(coupon);
            throw new RuntimeException("This coupon has been sold out");
        }

        // Get redeem cost
        int redeemCost = coupon.getRedeemCost() != null ? coupon.getRedeemCost() : 5;

        // Deduct points
        rewardPointsService.deductPointsById(userId, redeemCost);

        // Increment sold quantity
        coupon.setSoldQuantity(coupon.getSoldQuantity() + 1);

        // Check if sold out
        if (coupon.getSoldQuantity() >= coupon.getTotalQuantity()) {
            coupon.setIsActive(false);
            logger.debug("[REDEMPTION] Coupon {} is now sold out", couponId);
        }

        couponRepository.save(coupon);

        // Create redemption record
        CouponRedemption redemption = new CouponRedemption();
        redemption.setUserId(userId);
        redemption.setCouponId(couponId);
        redemption.setPointsDeducted(redeemCost);
        redemptionRepository.save(redemption);

        // Log activity
        logHistoryService.createLog(
                "Redeemed coupon: " + coupon.getTitle() + " (" + redeemCost + " points)",
                userId
        );

        logger.debug("[REDEMPTION] Successfully redeemed - Coupon: {}, User: {}, Points: {}",
                couponId, userId, redeemCost);
    }
}

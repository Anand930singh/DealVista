package com.coupon.backend.dto;

import java.time.Instant;
import java.util.UUID;

public record RedeemedCouponDto(
        UUID redemptionId,
        UUID couponId,
        String title,
        String code,
        String platform,
        String category,
        Integer pointsDeducted,
        Instant redeemedAt
) {
}

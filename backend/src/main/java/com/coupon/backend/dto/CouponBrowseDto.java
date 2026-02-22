package com.coupon.backend.dto;

import com.coupon.backend.enums.DiscountType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record CouponBrowseDto(
        UUID id,
        String title,
        String description,
        String platform,
        String category,
        DiscountType discountType,
        BigDecimal discountValue,
        BigDecimal minOrderValue,
        BigDecimal maxDiscountValue,
        LocalDate validFrom,
        LocalDate validTill,
        String terms,
        Boolean requiresUniqueUser,
        String usageType,
        String geoRestriction,
        Boolean isActive,
        Integer soldQuantity,
        BigDecimal price,
        Boolean isFree,
        Integer redeemCost,
        Instant createdAt
) {
}

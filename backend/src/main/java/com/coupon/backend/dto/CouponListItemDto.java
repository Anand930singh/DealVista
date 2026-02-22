package com.coupon.backend.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record CouponListItemDto(
        UUID id,
        String title,
        String code,
        String platform,
        String category,
        LocalDate validTill,
        Boolean isActive,
        Integer soldQuantity,
        Integer totalQuantity,
        Instant createdAt
) {
}

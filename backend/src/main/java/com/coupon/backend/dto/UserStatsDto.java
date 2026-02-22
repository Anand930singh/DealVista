package com.coupon.backend.dto;

public record UserStatsDto(
        Integer couponsAdded,
        Integer couponsRedeemed,
        Integer currentPoints,
        Integer totalPointsEarned,
        Integer totalPointsSpent
) {
}

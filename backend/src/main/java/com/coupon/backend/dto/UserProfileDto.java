package com.coupon.backend.dto;

import java.time.Instant;
import java.util.UUID;

public record UserProfileDto(
        UUID id,
        String fullName,
        String email,
        String role,
        Integer points,
        Instant createdAt
) {
}

package com.coupon.backend.dto;

import java.time.Instant;
import java.util.UUID;

public record LogHistoryResponseDto(
        UUID id,
        String message,
        Instant createdAt
) {
}

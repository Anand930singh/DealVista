package com.coupon.backend.dto;

import java.util.UUID;

public record UserDetailsResponseDto(
        UUID id,
        String fullName,
        String email,
        String token
) {
}

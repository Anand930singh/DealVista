package com.coupon.backend.dto;

public record UserDetailsResponseDto(
        String fullName,
        Integer points,
        String token
) {
}

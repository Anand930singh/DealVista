package com.coupon.backend.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum DiscountType {
    PERCENTAGE,
    FLAT;

    @JsonCreator
    public static DiscountType fromString(String value) {
        if (value == null || value.isBlank()) return null;
        String upper = value.trim().toUpperCase();
        try {
            return valueOf(upper);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    @JsonValue
    public String toValue() {
        return name();
    }
}

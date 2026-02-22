package com.coupon.backend.mapper;

import com.coupon.backend.dto.CouponBrowseDto;
import com.coupon.backend.dto.CouponRequestDto;
import com.coupon.backend.dto.CouponResponseDto;
import com.coupon.backend.entity.Coupon;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class CouponMapper {

    public Coupon toEntity(CouponRequestDto dto) {
        if (dto == null) return null;
        Coupon entity = new Coupon();
        entity.setTitle(dto.title());
        entity.setDescription(dto.description());
        entity.setCode(dto.code());
        entity.setPlatform(dto.platform());
        entity.setCategory(dto.category());
        entity.setDiscountType(dto.discountType());
        entity.setDiscountValue(dto.discountValue());
        entity.setMinOrderValue(dto.minOrderValue());
        entity.setMaxDiscountValue(dto.maxDiscountValue());
        entity.setValidFrom(dto.validFrom());
        entity.setValidTill(dto.validTill());
        entity.setTerms(dto.terms());
        entity.setRequiresUniqueUser(dto.requiresUniqueUser());
        entity.setUsageType(dto.usageType());
        entity.setGeoRestriction(dto.geoRestriction());
        entity.setIsActive(dto.isActive() != null ? dto.isActive() : true);
        entity.setTotalQuantity(dto.totalQuantity() != null ? dto.totalQuantity() : 1);
        entity.setPrice(dto.price());
        entity.setIsFree(dto.isFree() != null ? dto.isFree() : true);
        entity.setSoldQuantity(0);
        Instant now = Instant.now();
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        return entity;
    }

    public CouponResponseDto toResponseDto(Coupon entity) {
        if (entity == null) return null;
        return new CouponResponseDto(
                entity.getId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getCode(),
                entity.getPlatform(),
                entity.getCategory(),
                entity.getDiscountType(),
                entity.getDiscountValue(),
                entity.getMinOrderValue(),
                entity.getMaxDiscountValue(),
                entity.getValidFrom(),
                entity.getValidTill(),
                entity.getTerms(),
                entity.getRequiresUniqueUser(),
                entity.getUsageType(),
                entity.getGeoRestriction(),
                entity.getIsActive(),
                entity.getTotalQuantity(),
                entity.getSoldQuantity(),
                entity.getPrice(),
                entity.getIsFree(),
                entity.getRedeemCost(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public CouponBrowseDto toBrowseDto(Coupon entity) {
        if (entity == null) return null;
        return new CouponBrowseDto(
                entity.getId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getPlatform(),
                entity.getCategory(),
                entity.getDiscountType(),
                entity.getDiscountValue(),
                entity.getMinOrderValue(),
                entity.getMaxDiscountValue(),
                entity.getValidFrom(),
                entity.getValidTill(),
                entity.getTerms(),
                entity.getRequiresUniqueUser(),
                entity.getUsageType(),
                entity.getGeoRestriction(),
                entity.getIsActive(),
                entity.getSoldQuantity(),
                entity.getPrice(),
                entity.getIsFree(),
                entity.getRedeemCost(),
                entity.getCreatedAt()
        );
    }
}

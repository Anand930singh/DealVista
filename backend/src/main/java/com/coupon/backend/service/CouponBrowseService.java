package com.coupon.backend.service;

import com.coupon.backend.dto.CouponResponseDto;
import com.coupon.backend.entity.Coupon;
import com.coupon.backend.mapper.CouponMapper;
import com.coupon.backend.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CouponBrowseService {

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private CouponMapper couponMapper;

    /**
     * Returns all active coupons, newest first.
     */
    public List<CouponResponseDto> browseActive() {
        return couponRepository.findByIsActiveTrueOrderByCreatedAtDesc().stream()
                .map(couponMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Returns all coupons (for admin or when no filter). Newest first.
     */
    public List<CouponResponseDto> browseAll() {
        return couponRepository.findAll().stream()
                .sorted(Comparator.comparing(Coupon::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(couponMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    public CouponResponseDto getById(UUID id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found: " + id));
        return couponMapper.toResponseDto(coupon);
    }
}

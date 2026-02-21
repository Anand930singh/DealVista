package com.coupon.backend.service;

import com.coupon.backend.dto.CouponResponseDto;
import com.coupon.backend.entity.Coupon;
import com.coupon.backend.mapper.CouponMapper;
import com.coupon.backend.repository.CouponRepository;
import com.coupon.backend.repository.CouponSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CouponBrowseService {

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private CouponMapper couponMapper;

    public List<CouponResponseDto> browseActive() {
        return couponRepository.findByIsActiveTrueOrderByCreatedAtDesc().stream()
                .map(couponMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    public List<CouponResponseDto> browseAll() {
        return couponRepository.findAll().stream()
                .map(couponMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    public CouponResponseDto getById(UUID id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found: " + id));
        return couponMapper.toResponseDto(coupon);
    }

    /**
     * Browse coupons with filters and pagination applied at database level
     */
    public Map<String, Object> browseCouponsWithFilters(
            boolean activeOnly, String platform, String category, String discountType, String search,
            int page, int size) {
        
        // Create pageable with page number and size
        Pageable pageable = PageRequest.of(page, size);
        
        // Use Specification for database-level filtering with pagination
        Page<Coupon> couponPage = couponRepository.findAll(
            CouponSpecification.filterCoupons(activeOnly, platform, category, discountType, search),
            pageable
        );
        
        // Map to DTOs
        List<CouponResponseDto> coupons = couponPage.getContent().stream()
                .map(couponMapper::toResponseDto)
                .collect(Collectors.toList());
        
        // Build response with pagination metadata
        Map<String, Object> response = new HashMap<>();
        response.put("coupons", coupons);
        response.put("currentPage", couponPage.getNumber());
        response.put("totalPages", couponPage.getTotalPages());
        response.put("totalItems", couponPage.getTotalElements());
        response.put("pageSize", couponPage.getSize());
        response.put("hasNext", couponPage.hasNext());
        response.put("hasPrevious", couponPage.hasPrevious());
        
        return response;
    }
}

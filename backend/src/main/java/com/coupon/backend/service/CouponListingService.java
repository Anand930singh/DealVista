package com.coupon.backend.service;

import com.coupon.backend.dto.CouponRequestDto;
import com.coupon.backend.dto.CouponResponseDto;
import com.coupon.backend.entity.Coupon;
import com.coupon.backend.mapper.CouponMapper;
import com.coupon.backend.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CouponListingService {

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private CouponMapper couponMapper;

    @Autowired
    private RewardPointsService rewardPointsService;

    @Transactional
    public CouponResponseDto save(CouponRequestDto request, String listedByEmail) {
        Coupon entity = couponMapper.toEntity(request);
        Coupon saved = couponRepository.save(entity);
        rewardPointsService.addPointsByEmail(listedByEmail, 5);
        return couponMapper.toResponseDto(saved);
    }
}

package com.coupon.backend.service;

import com.coupon.backend.dto.CouponRequestDto;
import com.coupon.backend.dto.CouponResponseDto;
import com.coupon.backend.entity.Coupon;
import com.coupon.backend.mapper.CouponMapper;
import com.coupon.backend.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class CouponListingService {

    private static final Logger logger = LoggerFactory.getLogger(CouponListingService.class);

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private CouponMapper couponMapper;

    @Autowired
    private RewardPointsService rewardPointsService;

    @Transactional
    public CouponResponseDto save(CouponRequestDto request, String listedByEmail) {
        // Check if coupon code already exists in database
        if (request.code() != null && !request.code().trim().isEmpty()) {
            String code = request.code().trim();
            logger.debug("Checking if coupon code exists: {}", code);
            
            boolean codeExists = couponRepository.existsByCodeIgnoreCase(code);
            
            if (codeExists) {
                logger.warn("Duplicate coupon code attempt: {}", code);
                throw new RuntimeException("Coupon code \"" + code + "\" is already listed. Please use a different coupon code.");
            }
        }

        // Save the coupon
        Coupon entity = couponMapper.toEntity(request);
        Coupon saved = couponRepository.save(entity);
        logger.info("Coupon saved successfully - Code: {}", saved.getCode());
        
        // Add reward points
        rewardPointsService.addPointsByEmail(listedByEmail, 5);
        
        return couponMapper.toResponseDto(saved);
    }
}


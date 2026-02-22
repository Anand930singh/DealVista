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
import java.util.UUID;

@Service
public class CouponListingService {

    private static final Logger logger = LoggerFactory.getLogger(CouponListingService.class);

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private CouponMapper couponMapper;

    @Autowired
    private RewardPointsService rewardPointsService;

    @Autowired
    private LogHistoryService logHistoryService;

    @Transactional
    public CouponResponseDto save(CouponRequestDto request, UUID id) {
        if (request.code() != null && !request.code().trim().isEmpty()) {
            String code = request.code().trim();
            logger.debug("Checking if coupon code exists: {}", code);
            
            boolean codeExists = couponRepository.existsByCodeIgnoreCase(code);
            
            if (codeExists) {
                logger.warn("Duplicate coupon code attempt: {}", code);
                throw new RuntimeException("This coupon code already exists. Please try a different one.");
            }
        }


        Coupon entity = couponMapper.toEntity(request);
        entity.setListedByUserId(id);
        Coupon saved = couponRepository.save(entity);
        logger.debug("Coupon saved successfully - Code: {}", saved.getCode());
        
        rewardPointsService.addPointsById(id, 5);
        
        // Log user activity
        logHistoryService.createLog("Listed coupon: " + saved.getId() + ")", id);
        
        return couponMapper.toResponseDto(saved);
    }
}


package com.coupon.backend.controller;

import com.coupon.backend.dto.CouponRequestDto;
import com.coupon.backend.dto.CouponResponseDto;
import com.coupon.backend.service.CouponBrowseService;
import com.coupon.backend.service.CouponListingService;
import com.coupon.backend.service.RewardPointsService;
import com.coupon.backend.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/coupons")
@CrossOrigin(origins = {"https://coupon-collector.vercel.app", "http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class CouponController {

    private static final Logger logger = LoggerFactory.getLogger(CouponController.class);

    @Autowired
    private CouponListingService couponListingService;

    @Autowired
    private CouponBrowseService couponBrowseService;

    @Autowired
    private RewardPointsService rewardPointsService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<?> listCoupon(@Valid @RequestBody CouponRequestDto request,
                                        HttpServletRequest httpRequest) {
        logger.debug("[COUPON] List coupon request received");
        
        try {
            String token = httpRequest.getHeader("Authorization").substring(7);
            String userId = jwtUtil.extractUserId(token);
            String email = jwtUtil.extractEmail(token);
            
            logger.debug("[COUPON] User: {} ({})", email, userId);
            
            CouponResponseDto saved = couponListingService.save(request, UUID.fromString(userId));
                    
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (RuntimeException e) {
            logger.error("[COUPON] Failed to list: {}", e.getMessage());
            
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Unable to list coupon. Please try again.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/browse")
    public ResponseEntity<?> browseCoupons(
            @RequestParam(required = false, defaultValue = "true") boolean activeOnly,
            @RequestParam(required = false) String platform,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String discountType,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size) {
        logger.debug("[COUPON] Browse: active={}, platform={}, category={}, discountType={}, search={}, page={}, size={}", 
                activeOnly, platform, category, discountType, search, page, size);
        
        try {
            Map<String, Object> response = couponBrowseService.browseCouponsWithFilters(
                    activeOnly, platform, category, discountType, search, page, size);
            
            logger.debug("[COUPON] Retrieved page {} with {} coupons", page, 
                    ((List<?>) response.get("coupons")).size());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("[COUPON] Browse failed: {}", e.getMessage());
            
            Map<String, String> error = new HashMap<>();
            error.put("message", "Unable to load coupons. Please refresh the page.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCoupon(@PathVariable UUID id) {
        logger.debug("[COUPON] Get: {}", id);
        
        try {
            CouponResponseDto coupon = couponBrowseService.getById(id);
            return ResponseEntity.ok(coupon);
        } catch (RuntimeException e) {
            logger.warn("[COUPON] Not found: {}", id);
            
            Map<String, String> error = new HashMap<>();
            error.put("message", "Coupon not found or no longer available.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @PostMapping("/{id}/view-code")
    public ResponseEntity<?> viewCouponCode(@PathVariable UUID id,
                                           HttpServletRequest httpRequest) {
        logger.debug("[COUPON] View code: {}", id);
        
        try {
            String token = httpRequest.getHeader("Authorization").substring(7);
            String userId = jwtUtil.extractUserId(token);
            
            rewardPointsService.deductPointsById(UUID.fromString(userId), 5);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "5 points deducted successfully");
            response.put("userId", userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("[COUPON] View code failed: {}", e.getMessage());
            
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Unable to view coupon code. Please try again.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}

package com.coupon.backend.controller;

import com.coupon.backend.dto.CouponRequestDto;
import com.coupon.backend.dto.CouponResponseDto;
import com.coupon.backend.service.CouponBrowseService;
import com.coupon.backend.service.CouponListingService;
import com.coupon.backend.service.RewardPointsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/coupons")
@CrossOrigin(origins = {"https://coupon-collector.vercel.app", "http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class CouponController {

    @Autowired
    private CouponListingService couponListingService;

    @Autowired
    private CouponBrowseService couponBrowseService;

    @Autowired
    private RewardPointsService rewardPointsService;

    @PostMapping
    public ResponseEntity<?> listCoupon(@Valid @RequestBody CouponRequestDto request, Authentication authentication) {
        try {
            CouponResponseDto saved = couponListingService.save(request, authentication.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to save coupon");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/browse")
    public ResponseEntity<?> browseCoupons(
            @RequestParam(required = false, defaultValue = "true") boolean activeOnly) {
        try {
            List<CouponResponseDto> coupons = activeOnly
                    ? couponBrowseService.browseActive()
                    : couponBrowseService.browseAll();
            return ResponseEntity.ok(coupons);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to load coupons");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCoupon(@PathVariable UUID id) {
        try {
            CouponResponseDto coupon = couponBrowseService.getById(id);
            return ResponseEntity.ok(coupon);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Coupon not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @PostMapping("/{id}/view-code")
    public ResponseEntity<?> viewCouponCode(@PathVariable UUID id, Authentication authentication) {
        try {
            rewardPointsService.deductPointsByEmail(authentication.getName(), 5);
            Map<String, String> response = new HashMap<>();
            response.put("message", "5 points deducted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to deduct points");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}

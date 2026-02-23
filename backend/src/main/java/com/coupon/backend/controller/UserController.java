package com.coupon.backend.controller;

import com.coupon.backend.entity.UserDetail;
import com.coupon.backend.repository.UserDetailRepository;
import com.coupon.backend.service.UserService;
import com.coupon.backend.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = {"https://dealvista.vercel.app", "http://localhost:5173", "http://localhost:3000", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailRepository userDetailRepository;

    @GetMapping("/points")
    public ResponseEntity<?> getUserPoints(@RequestHeader("Authorization") String authHeader) {
        logger.debug("[USER] Get points request received");
        
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.warn("[USER] Get points rejected - Invalid header");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Authorization header missing or invalid"));
            }

            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);

            UserDetail user = userDetailRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Integer points = userService.getUserPoints(user.getId());
            
            logger.debug("[USER] Points retrieved for user: {} - Points: {}", email, points);

            Map<String, Object> response = new HashMap<>();
            response.put("points", points);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("[USER] Error fetching points: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch points: " + e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(@RequestHeader("Authorization") String authHeader) {
        logger.debug("[USER] Get profile request received");
        
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.warn("[USER] Get profile rejected - Invalid header");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Authorization header missing or invalid"));
            }

            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);

            UserDetail user = userDetailRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            return ResponseEntity.ok(userService.getUserProfile(user.getId()));
        } catch (Exception e) {
            logger.error("[USER] Error fetching profile: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch profile: " + e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getUserStats(@RequestHeader("Authorization") String authHeader) {
        logger.debug("[USER] Get stats request received");
        
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.warn("[USER] Get stats rejected - Invalid header");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Authorization header missing or invalid"));
            }

            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);

            UserDetail user = userDetailRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            return ResponseEntity.ok(userService.getUserStats(user.getId()));
        } catch (Exception e) {
            logger.error("[USER] Error fetching stats: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch stats: " + e.getMessage()));
        }
    }

    @GetMapping("/coupons/added")
    public ResponseEntity<?> getCouponsAdded(@RequestHeader("Authorization") String authHeader) {
        logger.debug("[USER] Get added coupons request received");
        
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.warn("[USER] Get added coupons rejected - Invalid header");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Authorization header missing or invalid"));
            }

            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);

            UserDetail user = userDetailRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            return ResponseEntity.ok(userService.getCouponsAddedByUser(user.getId()));
        } catch (Exception e) {
            logger.error("[USER] Error fetching added coupons: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch added coupons: " + e.getMessage()));
        }
    }

    @GetMapping("/coupons/redeemed")
    public ResponseEntity<?> getCouponsRedeemed(@RequestHeader("Authorization") String authHeader) {
        logger.debug("[USER] Get redeemed coupons request received");
        
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.warn("[USER] Get redeemed coupons rejected - Invalid header");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Authorization header missing or invalid"));
            }

            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);

            UserDetail user = userDetailRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            return ResponseEntity.ok(userService.getCouponsRedeemedByUser(user.getId()));
        } catch (Exception e) {
            logger.error("[USER] Error fetching redeemed coupons: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch redeemed coupons: " + e.getMessage()));
        }
    }
}

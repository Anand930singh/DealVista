package com.coupon.backend.controller;

import com.coupon.backend.dto.SingInRequestDto;
import com.coupon.backend.dto.UserDetailsRequestDto;
import com.coupon.backend.dto.UserDetailsResponseDto;
import com.coupon.backend.entity.UserDetail;
import com.coupon.backend.repository.UserDetailRepository;
import com.coupon.backend.service.AuthService;
import com.coupon.backend.util.JwtUtil;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"https://coupon-collector.vercel.app", "http://localhost:5173", "http://localhost:3000", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailRepository userDetailRepository;

    @PostMapping("/signup")
    public ResponseEntity<?> register(@Valid @RequestBody UserDetailsRequestDto requestDto) {
        logger.debug("[AUTH] Signup request received for email: {}", requestDto.email());
        logger.debug("[AUTH] Signup - Full name: {}", requestDto.fullName());
        
        try {
            UserDetailsResponseDto response = authService.register(requestDto);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            logger.error("[AUTH] Signup failed - {}: {}", requestDto.email(), e.getMessage());
            
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signIn(@Valid @RequestBody SingInRequestDto requestDto) {
        logger.debug("[AUTH] Signin request: {}", requestDto.email());
        
        try {
            UserDetailsResponseDto response = authService.signin(requestDto);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.warn("[AUTH] Signin failed - {}: {}", requestDto.email(), e.getMessage());
            
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    /**
     * Get user profile from JWT token
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(@RequestHeader("Authorization") String authHeader) {
        logger.debug("[AUTH] Profile request received");
        
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.warn("[AUTH] Profile rejected - Invalid header");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Authorization header missing or invalid"));
            }

            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);

            UserDetail user = userDetailRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            logger.debug("[AUTH] Profile retrieved: {}", email);

            Map<String, Object> profile = new HashMap<>();
            profile.put("id", user.getId().toString());
            profile.put("email", user.getEmail());
            profile.put("fullName", user.getFullName());
            profile.put("points", user.getPoints());
            profile.put("role", user.getRole());
            profile.put("createdAt", user.getCreatedAt());

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid token or user not found"));
        }
    }
}


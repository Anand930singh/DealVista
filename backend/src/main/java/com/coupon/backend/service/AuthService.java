package com.coupon.backend.service;

import com.coupon.backend.dto.SingInRequestDto;
import com.coupon.backend.dto.UserDetailsRequestDto;
import com.coupon.backend.dto.UserDetailsResponseDto;
import com.coupon.backend.entity.UserDetail;
import com.coupon.backend.mapper.UserDetailMapper;
import com.coupon.backend.repository.UserDetailRepository;
import com.coupon.backend.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserDetailRepository userDetailRepository;

    @Autowired
    private UserDetailMapper userDetailMapper;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private LogHistoryService logHistoryService;

    public UserDetailsResponseDto register(UserDetailsRequestDto requestDto) {
        logger.debug("[AUTH_SERVICE] Starting user registration for email: {}", requestDto.email());
        
        if (userDetailRepository.existsByEmail(requestDto.email())) {
            logger.warn("[AUTH_SERVICE] Registration failed - Email already exists: {}", requestDto.email());
            throw new RuntimeException("Email already registered. Please sign in or use a different email.");
        }
        
        logger.debug("[AUTH_SERVICE] Email validation passed - Creating user entity");
        UserDetail user = userDetailMapper.toEntity(requestDto);
        
        logger.debug("[AUTH_SERVICE] Saving user to database");
        UserDetail savedUser = userDetailRepository.save(user);
        logger.info("[AUTH_SERVICE] User saved successfully - ID: {}, Email: {}", savedUser.getId(), savedUser.getEmail());
        
        logger.debug("[AUTH_SERVICE] Generating JWT token for user: {}", savedUser.getEmail());
        String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getId().toString());
        
        // Log user activity
        logHistoryService.createLog("Account created successfully", savedUser.getId());
        
        logger.debug("[AUTH_SERVICE] Registration complete - Returning response");
        return userDetailMapper.toResponseDto(savedUser, token);
    }

    public UserDetailsResponseDto signin(SingInRequestDto requestDto) {
        logger.debug("[AUTH_SERVICE] Starting signin process for email: {}", requestDto.email());
        
        Optional<UserDetail> userOptional = userDetailRepository.findByEmail(requestDto.email());
        if (userOptional.isEmpty()) {
            logger.warn("[AUTH_SERVICE] Signin failed - User not found: {}", requestDto.email());
            throw new RuntimeException("No account found with this email. Please sign up first.");
        }
        
        logger.debug("[AUTH_SERVICE] User found - Validating password");
        UserDetail user = userOptional.get();

        if (!passwordEncoder.matches(requestDto.password(), user.getPassword())) {
            logger.warn("[AUTH_SERVICE] Signin failed - Invalid password for email: {}", requestDto.email());
            throw new RuntimeException("Incorrect password. Please try again.");
        }
        
        logger.info("[AUTH_SERVICE] Password validated successfully for user: {}", requestDto.email());
        logger.debug("[AUTH_SERVICE] Generating JWT token for user ID: {}", user.getId());
        
        String token = jwtUtil.generateToken(user.getEmail(), user.getId().toString());
        
        // Log user activity
        logHistoryService.createLog("Signed in successfully", user.getId());
        
        logger.debug("[AUTH_SERVICE] Signin complete - Returning response");
        return userDetailMapper.toResponseDto(user, token);
    }
}


package com.coupon.backend.controller;

import com.coupon.backend.dto.CouponRequestDto;
import com.coupon.backend.dto.ExtractRequestDto;
import com.coupon.backend.dto.ExtractResponseDto;
import com.coupon.backend.service.JsonExtractorService;
import com.coupon.backend.service.LogHistoryService;
import com.coupon.backend.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/extract")
public class JsonExtractorController {

    private static final Logger logger = LoggerFactory.getLogger(JsonExtractorController.class);

    @Autowired
    private JsonExtractorService jsonExtractorService;

    @Autowired
    private LogHistoryService logHistoryService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<?> extract(@Valid @RequestBody ExtractRequestDto request,
                                    HttpServletRequest httpRequest) {
        logger.debug("[EXTRACT_API] Extract request received");
        
        try {
            // Extract userId from token
            String token = httpRequest.getHeader("Authorization").substring(7);
            String userId = jwtUtil.extractUserId(token);
            
            logger.debug("[EXTRACT_API] Extracting for user: {}", userId);
            
            CouponRequestDto result = jsonExtractorService.extractFromPrompt(request.prompt());
            
            // Log extraction activity to database
            logHistoryService.createLog(
                "Used AI json extraction",
                UUID.fromString(userId)
            );
                        
            return ResponseEntity.ok(new ExtractResponseDto(result));
        } catch (RuntimeException e) {
            logger.error("[EXTRACT_API] Extraction failed: {}", e.getMessage());
            
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Unable to extract coupon details. Please try again.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}

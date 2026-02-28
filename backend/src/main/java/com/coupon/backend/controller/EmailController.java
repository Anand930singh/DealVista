package com.coupon.backend.controller;

import com.coupon.backend.dto.EmailRequestDto;
import com.coupon.backend.service.EmailService;
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
@RequestMapping("/email")
public class EmailController {

    private static final Logger logger = LoggerFactory.getLogger(EmailController.class);

    @Autowired
    private EmailService emailService;

    @PostMapping("/send")
    public ResponseEntity<?> sendEmail(@Valid @RequestBody EmailRequestDto emailRequestDto) {
        logger.info("[EMAIL] Request to send email to: {}", emailRequestDto.to());
        logger.debug("[EMAIL] Subject: {}", emailRequestDto.subject());
        
        try {
            emailService.sendPlainText(
                emailRequestDto.to(), 
                emailRequestDto.subject(), 
                emailRequestDto.body()
            );
            logger.info("[EMAIL] Email sent successfully to: {}", emailRequestDto.to());
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Email sent successfully");
            response.put("recipient", emailRequestDto.to());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("[EMAIL] Failed to send email to {}: {}", emailRequestDto.to(), e.getMessage());
            
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to send email: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}

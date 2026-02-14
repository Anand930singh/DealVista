package com.coupon.backend.controller;

import com.coupon.backend.dto.CouponRequestDto;
import com.coupon.backend.dto.ExtractRequestDto;
import com.coupon.backend.dto.ExtractResponseDto;
import com.coupon.backend.service.JsonExtractorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/extract")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class JsonExtractorController {

    @Autowired
    private JsonExtractorService jsonExtractorService;

    @PostMapping
    public ResponseEntity<?> extract(@Valid @RequestBody ExtractRequestDto request) {
        try {
            CouponRequestDto result = jsonExtractorService.extractFromPrompt(request.prompt());
            return ResponseEntity.ok(new ExtractResponseDto(result));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Extraction failed");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}

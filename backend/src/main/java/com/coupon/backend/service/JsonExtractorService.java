package com.coupon.backend.service;

import com.coupon.backend.dto.CouponRequestDto;
import com.coupon.backend.mapper.ExtractResultMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class JsonExtractorService {

    private static final Logger logger = LoggerFactory.getLogger(JsonExtractorService.class);

    private static final String MODEL = "gemini-3-flash-preview";

    private static final String INSTRUCTIONS = """
                Extract coupon details from the given text and return STRICT JSON only.

                Rules:
                - Ignore noise, duplicate lines, ads, symbols.
                - Return ONLY valid JSON.
                - Do NOT wrap in markdown.
                - If a field is not found, return null.
                - Dates must be in ISO format (yyyy-MM-dd). If validFrom (start date) is not found in the text, return null (it will be defaulted to today).
                - discountType must be either: FLAT or PERCENTAGE.
                - usageType must be either: SINGLE_USE, MULTI_USE, or UNLIMITED.
                - All numeric values must be numbers (not strings).
                - Extract terms and conditions: any fine print, eligibility rules, "valid for new users", "cannot be clubbed", expiry rules, etc. into "terms".

                Required JSON structure:

                {
                "title": string,
                "description": string,
                "code": string or null,
                "platform": string or null,
                "category": string or null,
                "discountType": "FLAT" or "PERCENTAGE" or null,
                "discountValue": number or null,
                "minOrderValue": number or null,
                "maxDiscountValue": number or null,
                "validFrom": "yyyy-MM-dd" or null,
                "validTill": "yyyy-MM-dd" or null,
                "terms": string or null,
                "requiresUniqueUser": boolean or null,
                "usageType": "SINGLE_USE" | "MULTI_USE" | "UNLIMITED" or null,
                "geoRestriction": string or null,
                "isActive": boolean,
                "totalQuantity": number,
                "soldQuantity": number,
                "price": number or null,
                "isFree": boolean,
                "createdAt": ISO-8601 timestamp or null,
                "updatedAt": ISO-8601 timestamp or null
                }
                """;


    private final Client client;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ExtractResultMapper extractResultMapper;

    public JsonExtractorService(
            @Value("${gemini.api_key}") String apiKey,
            @Autowired ExtractResultMapper extractResultMapper) {
        this.client = Client.builder().apiKey(apiKey).build();
        this.extractResultMapper = extractResultMapper;
    }

    public CouponRequestDto extractFromPrompt(String prompt) {
        logger.debug("[EXTRACT] Starting extraction from prompt - Length: {} chars", prompt.length());
        logger.debug("[EXTRACT] Prompt preview: {}...", prompt.substring(0, Math.min(100, prompt.length())));
        
        String finalPrompt = INSTRUCTIONS + "\n\nText:\n" + prompt;
        
        logger.debug("[EXTRACT] Calling Gemini API - Model: {}", MODEL);
        GenerateContentResponse response = client.models.generateContent(
                MODEL,
                finalPrompt,
                null);
        
        String raw = response.text();
        logger.debug("[EXTRACT] Received response - Length: {} chars", raw.length());
        
        String json = stripMarkdownJson(raw);
        logger.debug("[EXTRACT] Stripped JSON - Length: {} chars", json.length());
        
        try {
            Map<String, Object> map = objectMapper.readValue(json, new TypeReference<>() {});
            logger.info("[EXTRACT] Successfully parsed JSON - Fields: {}", map.keySet());
            
            CouponRequestDto result = extractResultMapper.toCouponRequestDto(map);
            
            return result;
        } catch (Exception e) {
            logger.error("[EXTRACT] Failed to parse JSON - Error: {}", e.getMessage());
            logger.debug("[EXTRACT] Raw JSON: {}", json);
            throw new RuntimeException("Failed to parse extracted JSON: " + e.getMessage(), e);
        }
    }

    private String stripMarkdownJson(String text) {
        if (text == null) return "{}";
        String s = text.trim();
        if (s.startsWith("```json")) {
            s = s.substring(7);
        } else if (s.startsWith("```")) {
            s = s.substring(3);
        }
        if (s.endsWith("```")) {
            s = s.substring(0, s.length() - 3);
        }
        return s.trim();
    }
}

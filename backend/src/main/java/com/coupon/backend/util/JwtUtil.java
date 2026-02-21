package com.coupon.backend.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration:86400000}") // 24 hours default
    private Long expiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String email, String userId) {
        logger.debug("[JWT] Generating token for email: {}, userId: {}", email, userId);
        
        Date issuedAt = new Date(System.currentTimeMillis());
        Date expiresAt = new Date(System.currentTimeMillis() + expiration);
        
        logger.debug("[JWT] Token expiration time: {} hours", expiration / 3600000);
        
        String token = Jwts.builder()
                .setSubject(email)
                .claim("userId", userId)
                .setIssuedAt(issuedAt)
                .setExpiration(expiresAt)
                .signWith(getSigningKey())
                .compact();
        
        logger.debug("[JWT] Token generated successfully - Length: {} chars", token.length());
        return token;
    }

    public String extractEmail(String token) {
        logger.debug("[JWT] Extracting email from token");
        
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            String email = claims.getSubject();
            logger.debug("[JWT] Email extracted successfully: {}", email);
            return email;
        } catch (Exception e) {
            logger.error("[JWT] Failed to extract email from token - Error: {}", e.getMessage());
            throw e;
        }
    }

    public String extractUserId(String token) {
        logger.debug("[JWT] Extracting userId from token");
        
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            String userId = claims.get("userId", String.class);
            logger.debug("[JWT] UserId extracted successfully: {}", userId);
            return userId;
        } catch (Exception e) {
            logger.error("[JWT] Failed to extract userId from token - Error: {}", e.getMessage());
            throw e;
        }
    }

    public Boolean validateToken(String token, String email) {
        logger.debug("[JWT] Validating token for email: {}", email);
        
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            String tokenEmail = claims.getSubject();
            logger.debug("[JWT] Token email: {}", tokenEmail);
            Date expiration = claims.getExpiration();
            logger.debug("[JWT] Token expiration: {}", expiration);
            
            boolean isValid = tokenEmail.equals(email) && expiration.after(new Date());
            
            if (isValid) {
                logger.debug("[JWT] Token validated successfully for email: {}", email);
            } else {
                logger.warn("[JWT] Token validation failed - Email match: {}, Expired: {}", 
                    tokenEmail.equals(email), !expiration.after(new Date()));
            }
            
            return isValid;
        } catch (Exception e) {
            logger.error("[JWT] Token validation exception - Error: {}", e.getMessage());
            return false;
        }
    }
}


package com.coupon.backend.filter;

import com.coupon.backend.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        logger.debug("[FILTER] Checking if filter should skip for path: {}", path);
        
        if (path == null) {
            return false;
        }
        
        boolean shouldSkip = path.startsWith("/api/auth/") || path.startsWith("/auth/") ||
               path.equals("/api/auth/signin") || path.equals("/auth/signin") ||
               path.equals("/api/auth/signup") || path.equals("/auth/signup");
        
        if (shouldSkip) {
            logger.debug("[FILTER] Skipping JWT filter for auth endpoint: {}", path);
        }
        
        return shouldSkip;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        logger.debug("[FILTER] Processing request: {} {}", request.getMethod(), path);
        
        final String authHeader = request.getHeader("Authorization");
        String email = null;
        String jwt = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            logger.debug("[FILTER] Authorization header found - Token length: {} chars", jwt.length());
            
            try {
                email = jwtUtil.extractEmail(jwt);
                logger.debug("[FILTER] Email extracted from token: {}", email);
            } catch (Exception e) {
                logger.error("[FILTER] Failed to extract email from token - Error: {}", e.getMessage());
            }
        } else {
            logger.debug("[FILTER] No valid Authorization header found");
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            logger.debug("[FILTER] Attempting to authenticate user: {}", email);
            
            try {
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                logger.debug("[FILTER] User details loaded for: {}", email);
                
                if (jwtUtil.validateToken(jwt, email)) {
                    logger.debug("[FILTER] Token validated successfully - Setting authentication context");
                    
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    logger.warn("[FILTER] Token validation failed for user: {}", email);
                }
            } catch (Exception e) {
                logger.error("[FILTER] Authentication failed - User: {}, Error: {}", email, e.getMessage());
            }
        } else if (email == null) {
            logger.debug("[FILTER] No email extracted from token - Request will proceed unauthenticated");
        }

        logger.debug("[FILTER] Proceeding with filter chain");
        filterChain.doFilter(request, response);
    }
}


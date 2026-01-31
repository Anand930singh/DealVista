package com.coupon.backend.service;

import com.coupon.backend.dto.SingInRequestDto;
import com.coupon.backend.dto.UserDetailsRequestDto;
import com.coupon.backend.dto.UserDetailsResponseDto;
import com.coupon.backend.entity.UserDetail;
import com.coupon.backend.mapper.UserDetailMapper;
import com.coupon.backend.repository.UserDetailRepository;
import com.coupon.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserDetailRepository userDetailRepository;

    @Autowired
    private UserDetailMapper userDetailMapper;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserDetailsResponseDto register(UserDetailsRequestDto requestDto) {
        // Check if user already exists
        if (userDetailRepository.existsByEmail(requestDto.email())) {
            throw new RuntimeException("User with email " + requestDto.email() + " already exists");
        }

        UserDetail user = userDetailMapper.toEntity(requestDto);
        UserDetail savedUser = userDetailRepository.save(user);
        String token = jwtUtil.generateToken(savedUser.getEmail());
        return userDetailMapper.toResponseDto(savedUser, token);
    }

    public UserDetailsResponseDto signin(SingInRequestDto requestDto) {
        Optional<UserDetail> userOptional = userDetailRepository.findByEmail(requestDto.email());
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User with email " + requestDto.email() + " does not exist");
        }

        UserDetail user = userOptional.get();

        if (!passwordEncoder.matches(requestDto.password(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return userDetailMapper.toResponseDto(user, token);
    }
}


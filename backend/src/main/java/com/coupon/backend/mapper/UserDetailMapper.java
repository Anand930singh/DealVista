package com.coupon.backend.mapper;

import com.coupon.backend.dto.UserDetailsRequestDto;
import com.coupon.backend.dto.UserDetailsResponseDto;
import com.coupon.backend.entity.UserDetail;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class UserDetailMapper {

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserDetail toEntity(UserDetailsRequestDto userDetailsRequestDto) {
        UserDetail userDetail = new UserDetail();
        userDetail.setFullName(userDetailsRequestDto.fullName());
        userDetail.setEmail(userDetailsRequestDto.email());
        userDetail.setPassword(passwordEncoder.encode(userDetailsRequestDto.password()));
        return userDetail;
    }

    public UserDetailsResponseDto toResponseDto(UserDetail userDetail, String token) {
        return new UserDetailsResponseDto(
                userDetail.getId(),
                userDetail.getFullName(),
                userDetail.getEmail(),
                token
        );
    }
}

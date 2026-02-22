package com.coupon.backend.mapper;

import com.coupon.backend.dto.UserDetailsRequestDto;
import com.coupon.backend.dto.UserDetailsResponseDto;
import com.coupon.backend.entity.UserDetail;
import com.coupon.backend.repository.UserDetailRepository;
import com.coupon.backend.util.ReferralCodeGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class UserDetailMapper {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserDetailRepository userDetailRepository;

    public UserDetail toEntity(UserDetailsRequestDto userDetailsRequestDto) {
        UserDetail userDetail = new UserDetail();
        userDetail.setFullName(userDetailsRequestDto.fullName());
        userDetail.setEmail(userDetailsRequestDto.email());
        userDetail.setPassword(passwordEncoder.encode(userDetailsRequestDto.password()));
        userDetail.setPoints(5);
        userDetail.setTotalPointsEarned(5); // Initial points count as earned
        userDetail.setTotalPointsSpent(0);

        String referralCode;
        do {
            referralCode = ReferralCodeGenerator.generateReferralCode();
        } while (userDetailRepository.existsByReferalCode(referralCode));
        
        userDetail.setReferalCode(referralCode);

        return userDetail;
    }

    public UserDetailsResponseDto toResponseDto(UserDetail userDetail, String token) {
        return new UserDetailsResponseDto(
                userDetail.getFullName(),
                userDetail.getPoints(),
                token,
                userDetail.getRole()
        );
    }
}


package com.coupon.backend.repository;

import com.coupon.backend.entity.UserDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserDetailRepository extends JpaRepository<UserDetail, UUID> {
    Optional<UserDetail> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByReferalCode(String referalCode);
    
    List<UserDetail> findByRole(String role);
    
    long countByCreatedAtBetween(Instant startDate, Instant endDate);
}

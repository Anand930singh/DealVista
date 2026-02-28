package com.coupon.backend.repository;

import com.coupon.backend.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CouponRepository extends JpaRepository<Coupon, UUID>, JpaSpecificationExecutor<Coupon> {

    List<Coupon> findByIsActiveTrueOrderByCreatedAtDesc();
    
    List<Coupon> findByListedByUserId(UUID listedByUserId);
    
    long countByListedByUserId(UUID listedByUserId);
    
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Coupon c WHERE UPPER(c.code) = UPPER(:code)")
    boolean existsByCodeIgnoreCase(@Param("code") String code);
    
    Optional<Coupon> findByCodeIgnoreCase(String code);
    
    // Count coupons created between dates
    long countByCreatedAtBetween(Instant startDate, Instant endDate);
}

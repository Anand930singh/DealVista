package com.coupon.backend.repository;

import com.coupon.backend.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CouponRepository extends JpaRepository<Coupon, UUID> {

    List<Coupon> findByIsActiveTrueOrderByCreatedAtDesc();
}

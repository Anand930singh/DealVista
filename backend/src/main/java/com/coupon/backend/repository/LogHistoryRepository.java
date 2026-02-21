package com.coupon.backend.repository;

import com.coupon.backend.entity.LogHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LogHistoryRepository extends JpaRepository<LogHistory, UUID> {
    List<LogHistory> findByUserId(UUID userId);
}

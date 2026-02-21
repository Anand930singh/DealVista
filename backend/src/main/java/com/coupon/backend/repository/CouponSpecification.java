package com.coupon.backend.repository;

import com.coupon.backend.entity.Coupon;
import com.coupon.backend.enums.DiscountType;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class CouponSpecification {

    public static Specification<Coupon> filterCoupons(
            Boolean activeOnly, 
            String platform, 
            String category, 
            String discountType, 
            String search) {
        
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Active filter
            if (activeOnly != null && activeOnly) {
                predicates.add(criteriaBuilder.isTrue(root.get("isActive")));
            }

            // Platform filter - only add if non-blank
            if (platform != null && !platform.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(
                    criteriaBuilder.lower(root.get("platform")), 
                    platform.trim().toLowerCase()
                ));
            }

            // Category filter - only add if non-blank
            if (category != null && !category.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(
                    criteriaBuilder.lower(root.get("category")), 
                    category.trim().toLowerCase()
                ));
            }

            // Discount type filter - only add if non-blank
            if (discountType != null && !discountType.trim().isEmpty()) {
                try {
                    DiscountType type = DiscountType.valueOf(discountType.trim().toUpperCase());
                    predicates.add(criteriaBuilder.equal(root.get("discountType"), type));
                } catch (IllegalArgumentException e) {
                    // Invalid discount type, skip this filter
                }
            }

            // Search filter - only add if non-blank
            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate titleMatch = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("title")), 
                    searchPattern
                );
                Predicate platformMatch = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("platform")), 
                    searchPattern
                );
                Predicate descMatch = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("description")), 
                    searchPattern
                );
                predicates.add(criteriaBuilder.or(titleMatch, platformMatch, descMatch));
            }

            // Order by createdAt desc
            query.orderBy(criteriaBuilder.desc(root.get("createdAt")));

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}

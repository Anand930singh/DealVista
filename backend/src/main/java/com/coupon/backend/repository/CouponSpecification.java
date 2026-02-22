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

            if (activeOnly != null && activeOnly) {
                predicates.add(criteriaBuilder.isTrue(root.get("isActive")));
            }

            if (platform != null && !platform.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(
                    criteriaBuilder.lower(root.get("platform")), 
                    platform.trim().toLowerCase()
                ));
            }

            if (category != null && !category.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(
                    criteriaBuilder.lower(root.get("category")), 
                    category.trim().toLowerCase()
                ));
            }

            if (discountType != null && !discountType.trim().isEmpty()) {
                try {
                    DiscountType type = DiscountType.valueOf(discountType.trim().toUpperCase());
                    predicates.add(criteriaBuilder.equal(root.get("discountType"), type));
                } catch (IllegalArgumentException e) {
                }
            }

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

            query.orderBy(criteriaBuilder.desc(root.get("createdAt")));

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}

package fpt.edu.vn.stationery.specification;

import fpt.edu.vn.stationery.constant.ProductStatus;
import fpt.edu.vn.stationery.entity.Product;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> filterPublicProducts(
            String keyword,
            Long categoryId,
            Long brandId,
            BigDecimal minPrice,
            BigDecimal maxPrice) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Only public products (status = ACTIVE)
            predicates.add(cb.equal(root.get("status"), ProductStatus.ACTIVE));

            // 2. Keyword search on product name (case-insensitive)
            if (keyword != null && !keyword.trim().isEmpty()) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("name")), pattern));
            }

            // 3. Category filter
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("categoryId"), categoryId));
            }

            // 4. Brand filter
            if (brandId != null) {
                predicates.add(cb.equal(root.get("brand").get("brandId"), brandId));
            }

            // 5. Min price filter
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            // 6. Max price filter
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Product> filterAdminProducts(
            String keyword,
            Long categoryId,
            Long brandId,
            String status) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Status filter: only filter if explicitly ACTIVE or INACTIVE. If null, blank or ALL, include ALL products!
            if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
                try {
                    ProductStatus productStatus = ProductStatus.valueOf(status.trim().toUpperCase());
                    predicates.add(cb.equal(root.get("status"), productStatus));
                } catch (IllegalArgumentException ignored) {
                }
            }

            // Keyword search on name or sku
            if (keyword != null && !keyword.trim().isEmpty()) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), pattern);
                Predicate skuMatch = cb.like(cb.lower(root.get("sku")), pattern);
                predicates.add(cb.or(nameMatch, skuMatch));
            }

            // Category filter
            if (categoryId != null && categoryId > 0) {
                predicates.add(cb.equal(root.get("category").get("categoryId"), categoryId));
            }

            // Brand filter
            if (brandId != null && brandId > 0) {
                predicates.add(cb.equal(root.get("brand").get("brandId"), brandId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

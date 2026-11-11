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
        return filterPublicProducts(keyword, categoryId, brandId, minPrice, maxPrice, null);
    }

    public static Specification<Product> filterPublicProducts(
            String keyword,
            Long categoryId,
            Long brandId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String stock) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Only public products (status = ACTIVE)
            predicates.add(cb.equal(root.get("status"), ProductStatus.ACTIVE));

            // 1b. Exclude products belonging to INACTIVE categories
            predicates.add(cb.or(
                    cb.isNull(root.get("category")),
                    cb.equal(root.get("category").get("status"), "ACTIVE")
            ));

            // 1c. Exclude products belonging to INACTIVE brands
            predicates.add(cb.or(
                    cb.isNull(root.get("brand")),
                    cb.equal(root.get("brand").get("status"), "ACTIVE")
            ));

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

            // 7. Stock status filter (inStock: stockQuantity > 0, outStock: stockQuantity <= 0)
            if (stock != null && !stock.isBlank()) {
                String s = stock.trim();
                if ("inStock".equalsIgnoreCase(s)) {
                    predicates.add(cb.greaterThan(root.get("stockQuantity"), 0));
                } else if ("outStock".equalsIgnoreCase(s) || "outOfStock".equalsIgnoreCase(s)) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("stockQuantity"), 0));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Product> filterAdminProducts(
            String keyword,
            Long categoryId,
            Long brandId,
            String status,
            String stock) {
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

            // Stock filter: OUT_OF_STOCK (<= 0), LOW_STOCK (1..5), IN_STOCK (> 0)
            if (stock != null && !stock.isBlank() && !stock.equalsIgnoreCase("ALL")) {
                String s = stock.trim();
                if ("OUT_OF_STOCK".equalsIgnoreCase(s) || "outOfStock".equalsIgnoreCase(s) || "outStock".equalsIgnoreCase(s)) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("stockQuantity"), 0));
                } else if ("LOW_STOCK".equalsIgnoreCase(s) || "lowStock".equalsIgnoreCase(s)) {
                    predicates.add(cb.and(
                            cb.greaterThan(root.get("stockQuantity"), 0),
                            cb.lessThanOrEqualTo(root.get("stockQuantity"), 5)
                    ));
                } else if ("IN_STOCK".equalsIgnoreCase(s) || "inStock".equalsIgnoreCase(s)) {
                    predicates.add(cb.greaterThan(root.get("stockQuantity"), 0));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Product> filterAdminProducts(
            String keyword,
            Long categoryId,
            Long brandId,
            String status) {
        return filterAdminProducts(keyword, categoryId, brandId, status, null);
    }
}

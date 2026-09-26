package fpt.edu.vn.stationery.specification;

import fpt.edu.vn.stationery.constant.ProductStatus;
import fpt.edu.vn.stationery.entity.Product;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> filterPublicProducts(String keyword, Long categoryId, Long brandId) {
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

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

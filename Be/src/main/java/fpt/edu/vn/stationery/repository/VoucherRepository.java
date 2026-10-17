package fpt.edu.vn.stationery.repository;

import fpt.edu.vn.stationery.entity.Voucher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {

    Optional<Voucher> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndVoucherIdNot(String code, Long voucherId);

    @Query("SELECT v FROM Voucher v WHERE " +
           "(:keyword IS NULL OR LOWER(v.code) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:isActive IS NULL OR v.isActive = :isActive) " +
           "ORDER BY v.createdAt DESC")
    Page<Voucher> searchVouchers(
            @Param("keyword") String keyword,
            @Param("isActive") Boolean isActive,
            Pageable pageable
    );

    @Query("SELECT v FROM Voucher v WHERE " +
           "(:keyword IS NULL OR LOWER(v.code) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:isActive IS NULL OR v.isActive = :isActive) " +
           "ORDER BY v.createdAt DESC")
    List<Voucher> searchVouchersList(
            @Param("keyword") String keyword,
            @Param("isActive") Boolean isActive
    );

    List<Voucher> findByIsActiveTrueOrderByCreatedAtDesc();
}

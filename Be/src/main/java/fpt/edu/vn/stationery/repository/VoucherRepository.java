package fpt.edu.vn.stationery.repository;

import fpt.edu.vn.stationery.entity.Voucher;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {

    Optional<Voucher> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndVoucherIdNot(String code, Long voucherId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from Voucher v where upper(v.code) = upper(:code)")
    Optional<Voucher> findByCodeForUpdate(@Param("code") String code);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from Voucher v where v.voucherId = :voucherId")
    Optional<Voucher> findByIdForUpdate(@Param("voucherId") Long voucherId);

    @Query("select v from Voucher v where (v.isActive = true or v.status = 'ACTIVE') " +
            "and (v.startDate is null or v.startDate <= :now) " +
            "and (v.endDate is null or v.endDate > :now) " +
            "and (v.usageLimit is null or v.usedCount < v.usageLimit) order by v.endDate, v.code")
    List<Voucher> findActive(@Param("now") LocalDateTime now);

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

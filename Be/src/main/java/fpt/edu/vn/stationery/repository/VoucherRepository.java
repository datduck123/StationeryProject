package fpt.edu.vn.stationery.repository;

import fpt.edu.vn.stationery.entity.Voucher;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {

    Optional<Voucher> findByCodeIgnoreCase(String code);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from Voucher v where upper(v.code) = upper(:code)")
    Optional<Voucher> findByCodeForUpdate(@Param("code") String code);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from Voucher v where v.voucherId = :voucherId")
    Optional<Voucher> findByIdForUpdate(@Param("voucherId") Long voucherId);

    @Query("select v from Voucher v where v.status = 'ACTIVE' and v.startDate <= :now " +
            "and v.endDate > :now and v.usedCount < v.usageLimit order by v.endDate, v.code")
    List<Voucher> findActive(@Param("now") LocalDateTime now);
}

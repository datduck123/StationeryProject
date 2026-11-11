-- Manual SQL Server script for Vouchers table strictly matching ERD
USE Stationery_Store;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID(N'dbo.vouchers', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.vouchers (
            voucher_id BIGINT IDENTITY(1,1) PRIMARY KEY,
            code VARCHAR(50) NOT NULL,
            discount_percent DECIMAL(5,2) NOT NULL,
            max_discount DECIMAL(18,2) NULL,
            min_order_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_Vouchers_MinOrderAmount DEFAULT (0),
            start_date DATETIME2 NULL,
            end_date DATETIME2 NULL,
            usage_limit INT NULL,
            used_count INT NOT NULL CONSTRAINT DF_Vouchers_UsedCount DEFAULT (0),
            is_active BIT NOT NULL CONSTRAINT DF_Vouchers_IsActive DEFAULT (1),
            created_at DATETIME2 NOT NULL CONSTRAINT DF_Vouchers_CreatedAt DEFAULT (SYSDATETIME()),
            updated_at DATETIME2 NULL,
            CONSTRAINT UQ_vouchers_code UNIQUE (code)
        );

        CREATE INDEX IX_vouchers_code ON dbo.vouchers(code);
        CREATE INDEX IX_vouchers_is_active ON dbo.vouchers(is_active);
    END;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

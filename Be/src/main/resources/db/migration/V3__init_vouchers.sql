IF OBJECT_ID(N'dbo.vouchers', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.vouchers (
        voucher_id BIGINT IDENTITY(1,1) PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        discount_percent DECIMAL(5,2) NOT NULL,
        max_discount DECIMAL(18,2) NULL,
        min_order_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
        start_date DATETIME2 NULL,
        end_date DATETIME2 NULL,
        usage_limit INT NULL,
        used_count INT NOT NULL DEFAULT 0,
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        updated_at DATETIME2 NULL
    );

    CREATE INDEX IX_vouchers_code ON dbo.vouchers(code);
    CREATE INDEX IX_vouchers_is_active ON dbo.vouchers(is_active);
END;

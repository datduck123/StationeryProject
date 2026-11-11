IF COL_LENGTH('dbo.Vouchers', 'discount_amount') IS NULL
BEGIN
    ALTER TABLE dbo.Vouchers ADD discount_amount DECIMAL(18,2) NULL;
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Vouchers WHERE code = 'CHAOBANMOI')
BEGIN
    INSERT INTO dbo.Vouchers (code, discount_amount, discount_percent, max_discount, min_order_amount, start_date, end_date, usage_limit, used_count, is_active, status, created_at, updated_at)
    VALUES ('CHAOBANMOI', 20000, 10.00, 30000, 100000, DATEADD(DAY, -30, SYSDATETIME()), DATEADD(DAY, 60, SYSDATETIME()), 500, 0, 1, 'ACTIVE', SYSDATETIME(), SYSDATETIME());
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Vouchers WHERE code = 'SUMMERSALE')
BEGIN
    INSERT INTO dbo.Vouchers (code, discount_amount, discount_percent, max_discount, min_order_amount, start_date, end_date, usage_limit, used_count, is_active, status, created_at, updated_at)
    VALUES ('SUMMERSALE', 50000, 15.00, 50000, 200000, DATEADD(DAY, -15, SYSDATETIME()), DATEADD(DAY, 30, SYSDATETIME()), 200, 0, 1, 'ACTIVE', SYSDATETIME(), SYSDATETIME());
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Vouchers WHERE code = 'VIPSTATIONERY')
BEGIN
    INSERT INTO dbo.Vouchers (code, discount_amount, discount_percent, max_discount, min_order_amount, start_date, end_date, usage_limit, used_count, is_active, status, created_at, updated_at)
    VALUES ('VIPSTATIONERY', 100000, 20.00, 100000, 500000, DATEADD(DAY, -60, SYSDATETIME()), DATEADD(DAY, 90, SYSDATETIME()), 100, 0, 1, 'ACTIVE', SYSDATETIME(), SYSDATETIME());
END;
GO

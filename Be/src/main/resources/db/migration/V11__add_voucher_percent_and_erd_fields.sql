IF COL_LENGTH('dbo.Vouchers', 'discount_percent') IS NULL
BEGIN
    ALTER TABLE dbo.Vouchers ADD discount_percent DECIMAL(5,2) NULL;
END;
GO

IF COL_LENGTH('dbo.Vouchers', 'max_discount') IS NULL
BEGIN
    ALTER TABLE dbo.Vouchers ADD max_discount DECIMAL(18,2) NULL;
END;
GO

IF COL_LENGTH('dbo.Vouchers', 'is_active') IS NULL
BEGIN
    ALTER TABLE dbo.Vouchers ADD is_active BIT NOT NULL CONSTRAINT DF_Vouchers_IsActive DEFAULT 1;
END;
GO

IF COL_LENGTH('dbo.Vouchers', 'updated_at') IS NULL
BEGIN
    ALTER TABLE dbo.Vouchers ADD updated_at DATETIME2 NULL;
END;
GO

IF OBJECT_ID('dbo.CK_Vouchers_Discount', 'C') IS NOT NULL
BEGIN
    ALTER TABLE dbo.Vouchers DROP CONSTRAINT CK_Vouchers_Discount;
END;
GO

ALTER TABLE dbo.Vouchers ALTER COLUMN discount_amount DECIMAL(18,2) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID('dbo.Vouchers') AND name = 'CK_Vouchers_Discount')
BEGIN
    ALTER TABLE dbo.Vouchers WITH CHECK ADD CONSTRAINT CK_Vouchers_Discount CHECK (
        (discount_amount IS NULL OR discount_amount > 0) AND
        (discount_percent IS NULL OR (discount_percent > 0 AND discount_percent <= 100))
    );
END;
GO

IF OBJECT_ID('dbo.CK_Vouchers_UsageLimit', 'C') IS NOT NULL
BEGIN
    ALTER TABLE dbo.Vouchers DROP CONSTRAINT CK_Vouchers_UsageLimit;
END;
GO

IF OBJECT_ID('dbo.CK_Vouchers_UsedCount', 'C') IS NOT NULL
BEGIN
    ALTER TABLE dbo.Vouchers DROP CONSTRAINT CK_Vouchers_UsedCount;
END;
GO

ALTER TABLE dbo.Vouchers ALTER COLUMN usage_limit INT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID('dbo.Vouchers') AND name = 'CK_Vouchers_UsageLimit')
BEGIN
    ALTER TABLE dbo.Vouchers WITH CHECK ADD CONSTRAINT CK_Vouchers_UsageLimit CHECK (usage_limit IS NULL OR usage_limit > 0);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID('dbo.Vouchers') AND name = 'CK_Vouchers_UsedCount')
BEGIN
    ALTER TABLE dbo.Vouchers WITH CHECK ADD CONSTRAINT CK_Vouchers_UsedCount CHECK (used_count >= 0 AND (usage_limit IS NULL OR used_count <= usage_limit));
END;
GO

IF OBJECT_ID('dbo.CK_Vouchers_Date', 'C') IS NOT NULL
BEGIN
    ALTER TABLE dbo.Vouchers DROP CONSTRAINT CK_Vouchers_Date;
END;
GO

ALTER TABLE dbo.Vouchers ALTER COLUMN start_date DATETIME2 NULL;
ALTER TABLE dbo.Vouchers ALTER COLUMN end_date DATETIME2 NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID('dbo.Vouchers') AND name = 'CK_Vouchers_Date')
BEGIN
    ALTER TABLE dbo.Vouchers WITH CHECK ADD CONSTRAINT CK_Vouchers_Date CHECK (start_date IS NULL OR end_date IS NULL OR end_date > start_date);
END;
GO

UPDATE dbo.Vouchers
SET is_active = CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END,
    updated_at = created_at,
    discount_percent = CASE 
        WHEN code = 'WELCOME20K' THEN 10.00
        WHEN code = 'SAVE50K' THEN 15.00
        WHEN code = 'NEWUSER10K' THEN 5.00
        ELSE 10.00
    END,
    max_discount = discount_amount
WHERE discount_percent IS NULL;
GO


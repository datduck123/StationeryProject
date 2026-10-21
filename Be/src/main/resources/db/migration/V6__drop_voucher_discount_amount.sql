-- V6: Drop the erroneous `discount_amount` column from vouchers table.
-- This column was added manually to the database but is NOT part of the ERD.
-- The vouchers table only needs discount_percent and max_discount per the ERD design.
IF EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.vouchers')
      AND name = N'discount_amount'
)
BEGIN
    -- 1. Drop check constraints referencing discount_amount or named CK_Vouchers_Discount
    DECLARE @chkSql NVARCHAR(MAX) = N'';
    SELECT @chkSql += N'ALTER TABLE dbo.vouchers DROP CONSTRAINT ' + QUOTENAME(name) + N'; '
    FROM sys.check_constraints
    WHERE parent_object_id = OBJECT_ID(N'dbo.vouchers')
      AND (definition LIKE N'%discount_amount%' OR name = N'CK_Vouchers_Discount');

    IF LEN(@chkSql) > 0
    BEGIN
        EXEC sp_executesql @chkSql;
    END

    -- 2. Drop default constraints on discount_amount
    DECLARE @defSql NVARCHAR(MAX) = N'';
    SELECT @defSql += N'ALTER TABLE dbo.vouchers DROP CONSTRAINT ' + QUOTENAME(dc.name) + N'; '
    FROM sys.default_constraints dc
    JOIN sys.columns c
        ON dc.parent_object_id = c.object_id
        AND dc.parent_column_id = c.column_id
    WHERE c.object_id = OBJECT_ID(N'dbo.vouchers')
      AND c.name = N'discount_amount';

    IF LEN(@defSql) > 0
    BEGIN
        EXEC sp_executesql @defSql;
    END

    -- 3. Drop indexes referencing discount_amount if any
    DECLARE @idxSql NVARCHAR(MAX) = N'';
    SELECT @idxSql += N'DROP INDEX ' + QUOTENAME(i.name) + N' ON dbo.vouchers; '
    FROM sys.indexes i
    JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
    JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
    WHERE i.object_id = OBJECT_ID(N'dbo.vouchers')
      AND c.name = N'discount_amount'
      AND i.is_primary_key = 0;

    IF LEN(@idxSql) > 0
    BEGIN
        EXEC sp_executesql @idxSql;
    END

    -- 4. Drop the column
    ALTER TABLE dbo.vouchers DROP COLUMN discount_amount;
END;


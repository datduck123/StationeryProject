-- Run in SSMS against Stationery_Store after 01_order_tables.sql.
-- This script checks the Order schema and deliberately attempts invalid
-- updates. Every attempt is inside a transaction that is rolled back.

USE Stationery_Store;
SET XACT_ABORT OFF;

SELECT t.name AS table_name, c.name AS column_name, ty.name AS data_type,
       c.max_length, c.precision, c.scale, c.is_nullable
FROM sys.tables AS t
JOIN sys.columns AS c ON c.object_id = t.object_id
JOIN sys.types AS ty ON ty.user_type_id = c.user_type_id
WHERE SCHEMA_NAME(t.schema_id) = N'dbo' AND t.name IN (N'Orders', N'OrderItems')
ORDER BY t.name, c.column_id;

SELECT OBJECT_NAME(fk.parent_object_id) AS table_name, fk.name AS foreign_key,
       OBJECT_NAME(fk.referenced_object_id) AS references_table,
       fk.delete_referential_action_desc AS on_delete,
       fk.is_disabled, fk.is_not_trusted
FROM sys.foreign_keys AS fk
WHERE fk.parent_object_id IN (OBJECT_ID(N'dbo.Orders'), OBJECT_ID(N'dbo.OrderItems'))
ORDER BY table_name, foreign_key;

SELECT OBJECT_NAME(cc.parent_object_id) AS table_name, cc.name AS check_name,
       cc.definition, cc.is_disabled, cc.is_not_trusted
FROM sys.check_constraints AS cc
WHERE cc.parent_object_id IN (OBJECT_ID(N'dbo.Orders'), OBJECT_ID(N'dbo.OrderItems'))
ORDER BY table_name, check_name;

DECLARE @orderId INT = (SELECT TOP (1) order_id FROM dbo.Orders ORDER BY order_id);
DECLARE @itemId INT = (SELECT TOP (1) order_item_id FROM dbo.OrderItems ORDER BY order_item_id);
DECLARE @results TABLE (test_name NVARCHAR(100), result VARCHAR(4), detail NVARCHAR(4000));

IF @orderId IS NULL OR @itemId IS NULL
BEGIN
    SELECT N'Need at least one existing order and item to test rejected updates.' AS message;
END
ELSE
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;

        BEGIN TRY
            UPDATE dbo.Orders SET order_status = 'INVALID' WHERE order_id = @orderId;
            INSERT INTO @results VALUES (N'Invalid order status', 'FAIL', N'Database accepted INVALID status');
        END TRY
        BEGIN CATCH
            INSERT INTO @results VALUES (N'Invalid order status', IIF(ERROR_NUMBER() = 547, 'PASS', 'FAIL'), ERROR_MESSAGE());
        END CATCH;

        BEGIN TRY
            UPDATE dbo.OrderItems SET quantity = 0 WHERE order_item_id = @itemId;
            INSERT INTO @results VALUES (N'Quantity = 0', 'FAIL', N'Database accepted zero quantity');
        END TRY
        BEGIN CATCH
            INSERT INTO @results VALUES (N'Quantity = 0', IIF(ERROR_NUMBER() = 547, 'PASS', 'FAIL'), ERROR_MESSAGE());
        END CATCH;

        BEGIN TRY
            UPDATE dbo.OrderItems SET order_id = -1 WHERE order_item_id = @itemId;
            INSERT INTO @results VALUES (N'Missing order FK', 'FAIL', N'Database accepted missing order');
        END TRY
        BEGIN CATCH
            INSERT INTO @results VALUES (N'Missing order FK', IIF(ERROR_NUMBER() = 547, 'PASS', 'FAIL'), ERROR_MESSAGE());
        END CATCH;

        BEGIN TRY
            UPDATE dbo.Orders SET voucher_id = -1 WHERE order_id = @orderId;
            INSERT INTO @results VALUES (N'Missing voucher FK', 'FAIL', N'Database accepted missing voucher');
        END TRY
        BEGIN CATCH
            INSERT INTO @results VALUES (N'Missing voucher FK', IIF(ERROR_NUMBER() = 547, 'PASS', 'FAIL'), ERROR_MESSAGE());
        END CATCH;

        ROLLBACK TRANSACTION;
        SELECT test_name, result, detail FROM @results;
        SELECT N'Test transaction rolled back; no order data was changed.' AS message;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;

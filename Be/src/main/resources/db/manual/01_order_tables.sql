-- SQL Server migration for the Order module only.
-- Run once in Stationery_Store using SSMS/sqlcmd after Users, Vouchers and
-- Products exist. It is safe to rerun: existing rows and tables are kept.
-- This project has no Flyway/Liquibase dependency, so this file is manual.

USE Stationery_Store;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID(N'dbo.Orders', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.Orders (
            order_id INT IDENTITY(1,1) NOT NULL,
            user_id INT NOT NULL,
            voucher_id INT NULL,
            subtotal DECIMAL(18,2) NOT NULL,
            discount_amount DECIMAL(18,2) NOT NULL
                CONSTRAINT DF_Orders_Discount DEFAULT (0),
            shipping_method VARCHAR(20) NOT NULL,
            total_weight_kg DECIMAL(10,3) NOT NULL,
            shipping_fee DECIMAL(18,2) NOT NULL,
            total_cost DECIMAL(18,2) NOT NULL,
            shipping_address NVARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            order_status VARCHAR(20) NOT NULL
                CONSTRAINT DF_Orders_Status DEFAULT ('PENDING'),
            note NVARCHAR(500) NULL,
            created_at DATETIME2 NOT NULL
                CONSTRAINT DF_Orders_CreatedAt DEFAULT (SYSDATETIME()),
            updated_at DATETIME2 NOT NULL
                CONSTRAINT DF_Orders_UpdatedAt DEFAULT (SYSDATETIME()),
            CONSTRAINT PK_Orders PRIMARY KEY (order_id)
        );
    END;

    IF OBJECT_ID(N'dbo.OrderItems', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.OrderItems (
            order_item_id INT IDENTITY(1,1) NOT NULL,
            order_id INT NOT NULL,
            product_id INT NOT NULL,
            product_name NVARCHAR(200) NOT NULL,
            unit_price DECIMAL(18,2) NOT NULL,
            quantity INT NOT NULL,
            subtotal DECIMAL(18,2) NOT NULL,
            CONSTRAINT PK_OrderItems PRIMARY KEY (order_item_id)
        );
    END;

    -- Fail clearly if a pre-existing table has a different shape. Do not
    -- silently change a populated column or truncate historical order data.
    IF EXISTS (
        SELECT 1
        FROM (VALUES
            (N'Orders', N'order_id', N'int', NULL, NULL, NULL, 0),
            (N'Orders', N'user_id', N'int', NULL, NULL, NULL, 0),
            (N'Orders', N'voucher_id', N'int', NULL, NULL, NULL, 1),
            (N'Orders', N'subtotal', N'decimal', NULL, 18, 2, 0),
            (N'Orders', N'discount_amount', N'decimal', NULL, 18, 2, 0),
            (N'Orders', N'shipping_method', N'varchar', 20, NULL, NULL, 0),
            (N'Orders', N'total_weight_kg', N'decimal', NULL, 10, 3, 0),
            (N'Orders', N'shipping_fee', N'decimal', NULL, 18, 2, 0),
            (N'Orders', N'total_cost', N'decimal', NULL, 18, 2, 0),
            (N'Orders', N'shipping_address', N'nvarchar', 510, NULL, NULL, 0),
            (N'Orders', N'phone', N'varchar', 20, NULL, NULL, 0),
            (N'Orders', N'order_status', N'varchar', 20, NULL, NULL, 0),
            (N'Orders', N'note', N'nvarchar', 1000, NULL, NULL, 1),
            (N'Orders', N'created_at', N'datetime2', NULL, NULL, NULL, 0),
            (N'Orders', N'updated_at', N'datetime2', NULL, NULL, NULL, 0),
            (N'OrderItems', N'order_item_id', N'int', NULL, NULL, NULL, 0),
            (N'OrderItems', N'order_id', N'int', NULL, NULL, NULL, 0),
            (N'OrderItems', N'product_id', N'int', NULL, NULL, NULL, 0),
            (N'OrderItems', N'product_name', N'nvarchar', 400, NULL, NULL, 0),
            (N'OrderItems', N'unit_price', N'decimal', NULL, 18, 2, 0),
            (N'OrderItems', N'quantity', N'int', NULL, NULL, NULL, 0),
            (N'OrderItems', N'subtotal', N'decimal', NULL, 18, 2, 0)
        ) AS expected(table_name, column_name, data_type, max_length, numeric_precision, numeric_scale, nullable)
        LEFT JOIN sys.tables AS t ON t.name = expected.table_name AND SCHEMA_NAME(t.schema_id) = N'dbo'
        LEFT JOIN sys.columns AS c ON c.object_id = t.object_id AND c.name = expected.column_name
        LEFT JOIN sys.types AS ty ON ty.user_type_id = c.user_type_id
        WHERE c.column_id IS NULL
           OR ty.name <> expected.data_type
           OR (expected.max_length IS NOT NULL AND c.max_length <> expected.max_length)
           OR (expected.numeric_precision IS NOT NULL AND c.precision <> expected.numeric_precision)
           OR (expected.numeric_scale IS NOT NULL AND c.scale <> expected.numeric_scale)
           OR c.is_nullable <> expected.nullable
    )
        THROW 51001, 'Orders/OrderItems columns differ from the agreed ERD; inspect the schema before migration.', 1;

    IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID(N'dbo.Orders') AND type = N'PK')
        ALTER TABLE dbo.Orders ADD CONSTRAINT PK_Orders PRIMARY KEY (order_id);
    IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID(N'dbo.OrderItems') AND type = N'PK')
        ALTER TABLE dbo.OrderItems ADD CONSTRAINT PK_OrderItems PRIMARY KEY (order_item_id);

    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE parent_object_id = OBJECT_ID(N'dbo.Orders') AND name = N'FK_Orders_Users')
        ALTER TABLE dbo.Orders WITH CHECK ADD CONSTRAINT FK_Orders_Users FOREIGN KEY (user_id) REFERENCES dbo.Users(user_id);
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE parent_object_id = OBJECT_ID(N'dbo.Orders') AND name = N'FK_Orders_Vouchers')
        ALTER TABLE dbo.Orders WITH CHECK ADD CONSTRAINT FK_Orders_Vouchers FOREIGN KEY (voucher_id) REFERENCES dbo.Vouchers(voucher_id);
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE parent_object_id = OBJECT_ID(N'dbo.OrderItems') AND name = N'FK_OrderItems_Orders')
        ALTER TABLE dbo.OrderItems WITH CHECK ADD CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (order_id) REFERENCES dbo.Orders(order_id) ON DELETE CASCADE;
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE parent_object_id = OBJECT_ID(N'dbo.OrderItems') AND name = N'FK_OrderItems_Products')
        ALTER TABLE dbo.OrderItems WITH CHECK ADD CONSTRAINT FK_OrderItems_Products FOREIGN KEY (product_id) REFERENCES dbo.Products(product_id);

    IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID(N'dbo.Orders') AND name = N'CK_Orders_Subtotal')
        ALTER TABLE dbo.Orders WITH CHECK ADD CONSTRAINT CK_Orders_Subtotal CHECK (subtotal >= 0);
    IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID(N'dbo.Orders') AND name = N'CK_Orders_Discount')
        ALTER TABLE dbo.Orders WITH CHECK ADD CONSTRAINT CK_Orders_Discount CHECK (discount_amount >= 0);
    IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID(N'dbo.Orders') AND name = N'CK_Orders_Weight')
        ALTER TABLE dbo.Orders WITH CHECK ADD CONSTRAINT CK_Orders_Weight CHECK (total_weight_kg > 0);
    IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID(N'dbo.Orders') AND name = N'CK_Orders_ShippingFee')
        ALTER TABLE dbo.Orders WITH CHECK ADD CONSTRAINT CK_Orders_ShippingFee CHECK (shipping_fee >= 0);
    IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID(N'dbo.Orders') AND name = N'CK_Orders_TotalCost')
        ALTER TABLE dbo.Orders WITH CHECK ADD CONSTRAINT CK_Orders_TotalCost CHECK (total_cost >= 0);
    IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID(N'dbo.Orders') AND name = N'CK_Orders_ShippingMethod')
        ALTER TABLE dbo.Orders WITH CHECK ADD CONSTRAINT CK_Orders_ShippingMethod CHECK (shipping_method IN ('STANDARD', 'EXPRESS'));
    IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID(N'dbo.Orders') AND name = N'CK_Orders_Status')
        ALTER TABLE dbo.Orders WITH CHECK ADD CONSTRAINT CK_Orders_Status CHECK (order_status IN ('PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'));

    IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID(N'dbo.OrderItems') AND name = N'CK_OrderItems_Price')
        ALTER TABLE dbo.OrderItems WITH CHECK ADD CONSTRAINT CK_OrderItems_Price CHECK (unit_price >= 0);
    IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID(N'dbo.OrderItems') AND name = N'CK_OrderItems_Quantity')
        ALTER TABLE dbo.OrderItems WITH CHECK ADD CONSTRAINT CK_OrderItems_Quantity CHECK (quantity > 0);
    IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID(N'dbo.OrderItems') AND name = N'CK_OrderItems_Subtotal')
        ALTER TABLE dbo.OrderItems WITH CHECK ADD CONSTRAINT CK_OrderItems_Subtotal CHECK (subtotal >= 0);

    -- Validate existing rows and re-enable an existing constraint if needed.
    ALTER TABLE dbo.Orders WITH CHECK CHECK CONSTRAINT FK_Orders_Users, FK_Orders_Vouchers,
        CK_Orders_Subtotal, CK_Orders_Discount, CK_Orders_Weight,
        CK_Orders_ShippingFee, CK_Orders_TotalCost, CK_Orders_ShippingMethod, CK_Orders_Status;
    ALTER TABLE dbo.OrderItems WITH CHECK CHECK CONSTRAINT FK_OrderItems_Orders, FK_OrderItems_Products,
        CK_OrderItems_Price, CK_OrderItems_Quantity, CK_OrderItems_Subtotal;

    IF NOT EXISTS (SELECT 1 FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID(N'dbo.Orders') AND name = N'DF_Orders_Discount')
        AND NOT EXISTS (SELECT 1 FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID(N'dbo.Orders') AND parent_column_id = COLUMNPROPERTY(OBJECT_ID(N'dbo.Orders'), N'discount_amount', 'ColumnId'))
        ALTER TABLE dbo.Orders ADD CONSTRAINT DF_Orders_Discount DEFAULT (0) FOR discount_amount;
    IF NOT EXISTS (SELECT 1 FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID(N'dbo.Orders') AND name = N'DF_Orders_Status')
        AND NOT EXISTS (SELECT 1 FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID(N'dbo.Orders') AND parent_column_id = COLUMNPROPERTY(OBJECT_ID(N'dbo.Orders'), N'order_status', 'ColumnId'))
        ALTER TABLE dbo.Orders ADD CONSTRAINT DF_Orders_Status DEFAULT ('PENDING') FOR order_status;
    IF NOT EXISTS (SELECT 1 FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID(N'dbo.Orders') AND name = N'DF_Orders_CreatedAt')
        AND NOT EXISTS (SELECT 1 FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID(N'dbo.Orders') AND parent_column_id = COLUMNPROPERTY(OBJECT_ID(N'dbo.Orders'), N'created_at', 'ColumnId'))
        ALTER TABLE dbo.Orders ADD CONSTRAINT DF_Orders_CreatedAt DEFAULT (SYSDATETIME()) FOR created_at;
    IF NOT EXISTS (SELECT 1 FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID(N'dbo.Orders') AND name = N'DF_Orders_UpdatedAt')
        AND NOT EXISTS (SELECT 1 FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID(N'dbo.Orders') AND parent_column_id = COLUMNPROPERTY(OBJECT_ID(N'dbo.Orders'), N'updated_at', 'ColumnId'))
        ALTER TABLE dbo.Orders ADD CONSTRAINT DF_Orders_UpdatedAt DEFAULT (SYSDATETIME()) FOR updated_at;

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Orders') AND name = N'IX_Orders_User')
        CREATE INDEX IX_Orders_User ON dbo.Orders(user_id);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Orders') AND name = N'IX_Orders_Status')
        CREATE INDEX IX_Orders_Status ON dbo.Orders(order_status);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Orders') AND name = N'IX_Orders_CreatedAt')
        CREATE INDEX IX_Orders_CreatedAt ON dbo.Orders(created_at);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.OrderItems') AND name = N'IX_OrderItems_Order')
        CREATE INDEX IX_OrderItems_Order ON dbo.OrderItems(order_id);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.OrderItems') AND name = N'IX_OrderItems_Product')
        CREATE INDEX IX_OrderItems_Product ON dbo.OrderItems(product_id);

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

IF COL_LENGTH('dbo.Orders', 'tracking_code') IS NULL
BEGIN
    ALTER TABLE dbo.Orders ADD tracking_code VARCHAR(40) NULL;
END;
GO

UPDATE dbo.Orders
SET tracking_code = 'ST-LEGACY-' + CAST(order_id AS VARCHAR(20))
WHERE tracking_code IS NULL;

ALTER TABLE dbo.Orders ALTER COLUMN tracking_code VARCHAR(40) NOT NULL;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.Orders') AND name = 'UQ_Orders_TrackingCode')
BEGIN
    CREATE UNIQUE INDEX UQ_Orders_TrackingCode ON dbo.Orders(tracking_code);
END;

-- Reconcile baselined installations whose original order tables missed constraints.
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID('dbo.Orders') AND name = 'CK_Orders_Subtotal')
    ALTER TABLE dbo.Orders WITH CHECK ADD CONSTRAINT CK_Orders_Subtotal CHECK (subtotal >= 0);
ALTER TABLE dbo.Orders WITH CHECK CHECK CONSTRAINT CK_Orders_Subtotal;

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID('dbo.Orders') AND name = 'CK_Orders_Discount')
    ALTER TABLE dbo.Orders WITH CHECK ADD CONSTRAINT CK_Orders_Discount CHECK (discount_amount >= 0);
ALTER TABLE dbo.Orders WITH CHECK CHECK CONSTRAINT CK_Orders_Discount;

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID('dbo.Orders') AND name = 'CK_Orders_Weight')
    ALTER TABLE dbo.Orders WITH CHECK ADD CONSTRAINT CK_Orders_Weight CHECK (total_weight_kg > 0);
ALTER TABLE dbo.Orders WITH CHECK CHECK CONSTRAINT CK_Orders_Weight;

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID('dbo.Orders') AND name = 'CK_Orders_ShippingFee')
    ALTER TABLE dbo.Orders WITH CHECK ADD CONSTRAINT CK_Orders_ShippingFee CHECK (shipping_fee >= 0);
ALTER TABLE dbo.Orders WITH CHECK CHECK CONSTRAINT CK_Orders_ShippingFee;

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID('dbo.Orders') AND name = 'CK_Orders_TotalCost')
    ALTER TABLE dbo.Orders WITH CHECK ADD CONSTRAINT CK_Orders_TotalCost CHECK (total_cost >= 0);
ALTER TABLE dbo.Orders WITH CHECK CHECK CONSTRAINT CK_Orders_TotalCost;

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID('dbo.Orders') AND name = 'CK_Orders_ShippingMethod')
    ALTER TABLE dbo.Orders WITH CHECK ADD CONSTRAINT CK_Orders_ShippingMethod CHECK (shipping_method IN ('STANDARD','EXPRESS'));
ALTER TABLE dbo.Orders WITH CHECK CHECK CONSTRAINT CK_Orders_ShippingMethod;

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID('dbo.Orders') AND name = 'CK_Orders_Status')
    ALTER TABLE dbo.Orders WITH CHECK ADD CONSTRAINT CK_Orders_Status CHECK (order_status IN ('PENDING','CONFIRMED','SHIPPING','DELIVERED','CANCELLED'));
ALTER TABLE dbo.Orders WITH CHECK CHECK CONSTRAINT CK_Orders_Status;

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID('dbo.OrderItems') AND name = 'CK_OrderItems_Price')
    ALTER TABLE dbo.OrderItems WITH CHECK ADD CONSTRAINT CK_OrderItems_Price CHECK (unit_price >= 0);
ALTER TABLE dbo.OrderItems WITH CHECK CHECK CONSTRAINT CK_OrderItems_Price;

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID('dbo.OrderItems') AND name = 'CK_OrderItems_Quantity')
    ALTER TABLE dbo.OrderItems WITH CHECK ADD CONSTRAINT CK_OrderItems_Quantity CHECK (quantity > 0);
ALTER TABLE dbo.OrderItems WITH CHECK CHECK CONSTRAINT CK_OrderItems_Quantity;

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID('dbo.OrderItems') AND name = 'CK_OrderItems_Subtotal')
    ALTER TABLE dbo.OrderItems WITH CHECK ADD CONSTRAINT CK_OrderItems_Subtotal CHECK (subtotal >= 0);
ALTER TABLE dbo.OrderItems WITH CHECK CHECK CONSTRAINT CK_OrderItems_Subtotal;

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE parent_object_id = OBJECT_ID('dbo.Orders') AND name = 'FK_Orders_Users')
    ALTER TABLE dbo.Orders WITH CHECK ADD CONSTRAINT FK_Orders_Users FOREIGN KEY (user_id) REFERENCES dbo.Users(user_id);
ALTER TABLE dbo.Orders WITH CHECK CHECK CONSTRAINT FK_Orders_Users;

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE parent_object_id = OBJECT_ID('dbo.Orders') AND name = 'FK_Orders_Vouchers')
    ALTER TABLE dbo.Orders WITH CHECK ADD CONSTRAINT FK_Orders_Vouchers FOREIGN KEY (voucher_id) REFERENCES dbo.Vouchers(voucher_id);
ALTER TABLE dbo.Orders WITH CHECK CHECK CONSTRAINT FK_Orders_Vouchers;

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE parent_object_id = OBJECT_ID('dbo.OrderItems') AND name = 'FK_OrderItems_Orders')
    ALTER TABLE dbo.OrderItems WITH CHECK ADD CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (order_id) REFERENCES dbo.Orders(order_id) ON DELETE CASCADE;
ALTER TABLE dbo.OrderItems WITH CHECK CHECK CONSTRAINT FK_OrderItems_Orders;

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE parent_object_id = OBJECT_ID('dbo.OrderItems') AND name = 'FK_OrderItems_Products')
    ALTER TABLE dbo.OrderItems WITH CHECK ADD CONSTRAINT FK_OrderItems_Products FOREIGN KEY (product_id) REFERENCES dbo.Products(product_id);
ALTER TABLE dbo.OrderItems WITH CHECK CHECK CONSTRAINT FK_OrderItems_Products;


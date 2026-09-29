-- Flyway migration for Orders and OrderItems matching SQL Server schema
IF OBJECT_ID(N'dbo.Orders', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Orders (
        order_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        user_id INT NOT NULL,
        voucher_id INT NULL,
        subtotal DECIMAL(18,2) NOT NULL,
        discount_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
        shipping_method VARCHAR(20) NOT NULL,
        total_weight_kg DECIMAL(10,3) NOT NULL,
        shipping_fee DECIMAL(18,2) NOT NULL,
        total_cost DECIMAL(18,2) NOT NULL,
        shipping_address NVARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        order_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        note NVARCHAR(500) NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_Orders_Users FOREIGN KEY (user_id) REFERENCES Users(user_id),
        CONSTRAINT FK_Orders_Vouchers FOREIGN KEY (voucher_id) REFERENCES Vouchers(voucher_id)
    );
END;

IF OBJECT_ID(N'dbo.OrderItems', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.OrderItems (
        order_item_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        product_name NVARCHAR(200) NOT NULL,
        unit_price DECIMAL(18,2) NOT NULL,
        quantity INT NOT NULL,
        subtotal DECIMAL(18,2) NOT NULL,
        CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
        CONSTRAINT FK_OrderItems_Products FOREIGN KEY (product_id) REFERENCES Products(product_id)
    );
END;

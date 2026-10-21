IF OBJECT_ID(N'dbo.Reviews', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Reviews (
        review_id     INT IDENTITY(1,1) PRIMARY KEY,
        order_item_id INT            NOT NULL,
        user_id       INT            NOT NULL,
        product_id    INT            NOT NULL,
        rating        INT            NOT NULL,
        comment       NVARCHAR(1000) NOT NULL,
        created_at    DATETIME2      NOT NULL CONSTRAINT DF_Reviews_CreatedAt DEFAULT SYSDATETIME(),
        CONSTRAINT FK_Reviews_OrderItems FOREIGN KEY (order_item_id)
            REFERENCES dbo.OrderItems(order_item_id) ON DELETE CASCADE,
        CONSTRAINT FK_Reviews_Users FOREIGN KEY (user_id)
            REFERENCES dbo.Users(user_id),
        CONSTRAINT FK_Reviews_Products FOREIGN KEY (product_id)
            REFERENCES dbo.Products(product_id),
        CONSTRAINT UQ_Reviews_OrderItem UNIQUE (order_item_id),
        CONSTRAINT CK_Reviews_Rating CHECK (rating BETWEEN 1 AND 5),
        CONSTRAINT CK_Reviews_Comment CHECK (LEN(LTRIM(RTRIM(comment))) BETWEEN 3 AND 1000)
    );
END;

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.Reviews')
      AND name = N'IX_Reviews_Product_CreatedAt'
)
BEGIN
    CREATE INDEX IX_Reviews_Product_CreatedAt
        ON dbo.Reviews(product_id, created_at DESC);
END;

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.Reviews')
      AND name = N'IX_Reviews_User_CreatedAt'
)
BEGIN
    CREATE INDEX IX_Reviews_User_CreatedAt
        ON dbo.Reviews(user_id, created_at DESC);
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_OrderItems_ProductId'
      AND object_id = OBJECT_ID(N'dbo.OrderItems')
)
BEGIN
    CREATE INDEX IX_OrderItems_ProductId ON dbo.OrderItems(product_id);
END;

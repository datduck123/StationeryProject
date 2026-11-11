/* Reconcile databases that already had Reviews before Flyway V7.
   Existing invalid rows are reported, never deleted by this migration. */
IF OBJECT_ID(N'dbo.Reviews', N'U') IS NULL
    THROW 51009, 'Reviews is missing. Apply the create-reviews migration first.', 1;

IF COL_LENGTH(N'dbo.Reviews', N'order_item_id') IS NULL
    OR COL_LENGTH(N'dbo.Reviews', N'rating') IS NULL
    OR COL_LENGTH(N'dbo.Reviews', N'comment') IS NULL
    THROW 51009, 'Reviews is missing order_item_id, rating or comment; repair the legacy schema first.', 1;

IF COL_LENGTH(N'dbo.Reviews', N'product_id') IS NULL
    EXEC(N'ALTER TABLE dbo.Reviews ADD product_id INT NULL;');
IF COL_LENGTH(N'dbo.Reviews', N'user_id') IS NULL
    EXEC(N'ALTER TABLE dbo.Reviews ADD user_id INT NULL;');

EXEC(N'
    UPDATE r SET product_id = oi.product_id
    FROM dbo.Reviews r JOIN dbo.OrderItems oi ON oi.order_item_id = r.order_item_id
    WHERE r.product_id IS NULL;
    UPDATE r SET user_id = o.user_id
    FROM dbo.Reviews r JOIN dbo.OrderItems oi ON oi.order_item_id = r.order_item_id
    JOIN dbo.Orders o ON o.order_id = oi.order_id WHERE r.user_id IS NULL;
    IF EXISTS (SELECT 1 FROM dbo.Reviews WHERE order_item_id IS NULL OR user_id IS NULL
        OR product_id IS NULL OR rating IS NULL OR comment IS NULL)
        THROW 51009, ''Reviews contains rows with missing required fields.'', 1;
    IF EXISTS (SELECT order_item_id FROM dbo.Reviews GROUP BY order_item_id HAVING COUNT(*) > 1)
        THROW 51009, ''Reviews contains duplicate order_item_id values; reconcile them before migrating.'', 1;
    IF EXISTS (SELECT 1 FROM dbo.Reviews r JOIN dbo.OrderItems oi ON oi.order_item_id = r.order_item_id
        JOIN dbo.Orders o ON o.order_id = oi.order_id
        WHERE r.product_id <> oi.product_id OR r.user_id <> o.user_id)
        THROW 51009, ''Review product or customer does not match its purchased order item.'', 1;
    ALTER TABLE dbo.Reviews ALTER COLUMN order_item_id INT NOT NULL;
    ALTER TABLE dbo.Reviews ALTER COLUMN user_id INT NOT NULL;
    ALTER TABLE dbo.Reviews ALTER COLUMN product_id INT NOT NULL;
    ALTER TABLE dbo.Reviews ALTER COLUMN rating INT NOT NULL;
    ALTER TABLE dbo.Reviews ALTER COLUMN comment NVARCHAR(1000) NOT NULL;
');

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes i
    JOIN sys.index_columns ic ON ic.object_id = i.object_id AND ic.index_id = i.index_id
    JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
    WHERE i.object_id = OBJECT_ID(N'dbo.Reviews') AND i.is_unique = 1
      AND i.has_filter = 0 AND c.name = N'order_item_id' AND ic.key_ordinal = 1
      AND NOT EXISTS (SELECT 1 FROM sys.index_columns other
          WHERE other.object_id = i.object_id AND other.index_id = i.index_id AND other.key_ordinal > 1)
)
    ALTER TABLE dbo.Reviews ADD CONSTRAINT UQ_Reviews_OrderItem_M4 UNIQUE (order_item_id);

IF OBJECT_ID(N'dbo.CK_Reviews_Rating', N'C') IS NULL
    ALTER TABLE dbo.Reviews WITH CHECK ADD CONSTRAINT CK_Reviews_Rating CHECK (rating BETWEEN 1 AND 5);
IF OBJECT_ID(N'dbo.CK_Reviews_Comment', N'C') IS NULL
    ALTER TABLE dbo.Reviews WITH CHECK ADD CONSTRAINT CK_Reviews_Comment
        CHECK (LEN(LTRIM(RTRIM(comment))) BETWEEN 3 AND 1000);
IF OBJECT_ID(N'dbo.FK_Reviews_OrderItems', N'F') IS NULL
    ALTER TABLE dbo.Reviews WITH CHECK ADD CONSTRAINT FK_Reviews_OrderItems
        FOREIGN KEY (order_item_id) REFERENCES dbo.OrderItems(order_item_id) ON DELETE CASCADE;
IF OBJECT_ID(N'dbo.FK_Reviews_Users', N'F') IS NULL
    ALTER TABLE dbo.Reviews WITH CHECK ADD CONSTRAINT FK_Reviews_Users
        FOREIGN KEY (user_id) REFERENCES dbo.Users(user_id);
IF OBJECT_ID(N'dbo.FK_Reviews_Products', N'F') IS NULL
    EXEC(N'ALTER TABLE dbo.Reviews WITH CHECK ADD CONSTRAINT FK_Reviews_Products
        FOREIGN KEY (product_id) REFERENCES dbo.Products(product_id);');

ALTER TABLE dbo.Reviews WITH CHECK CHECK CONSTRAINT ALL;

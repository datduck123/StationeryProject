-- V12: Add sold column to Products table
-- The sold column tracks the total number of units sold after orders are successfully delivered.
-- It is incremented when an order status transitions to DELIVERED.

IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID('Products') AND name = 'sold'
)
BEGIN
    ALTER TABLE Products ADD sold INT NOT NULL CONSTRAINT DF_Products_Sold DEFAULT 0;
END;

-- Backfill sold count from any existing DELIVERED orders in the database
UPDATE p
SET p.sold = ISNULL(s.total_sold, 0)
FROM Products p
LEFT JOIN (
    SELECT oi.product_id, SUM(oi.quantity) AS total_sold
    FROM OrderItems oi
    JOIN Orders o ON oi.order_id = o.order_id
    WHERE o.order_status = 'DELIVERED'
    GROUP BY oi.product_id
) s ON p.product_id = s.product_id;

-- Index to optimize querying best seller products (ordered by sold DESC)
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes 
    WHERE object_id = OBJECT_ID('Products') AND name = 'IX_Products_Sold'
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_Products_Sold ON Products(sold DESC, status);
END;

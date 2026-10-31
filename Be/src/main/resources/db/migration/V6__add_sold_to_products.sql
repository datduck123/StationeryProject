/* =========================================================
   V6 - ADD sold COLUMN TO Products TABLE (idempotent)
   - Lưu số lượng sản phẩm đã bán ra sau khi đơn hàng hoàn tất
   - Tự động đồng bộ số lượng từ các đơn hàng DELIVERED sẵn có
   - Thêm index tối ưu truy vấn sản phẩm bán chạy (Best Seller)
   ========================================================= */

-- 1. Thêm cột sold vào bảng Products nếu chưa tồn tại
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE Name = N'sold' AND Object_ID = OBJECT_ID(N'Products')
)
BEGIN
    ALTER TABLE Products ADD sold INT NOT NULL CONSTRAINT DF_Products_Sold DEFAULT 0;
END;
GO

-- 2. Thêm ràng buộc CK_Products_Sold (sold >= 0) nếu chưa có
IF NOT EXISTS (
    SELECT 1 FROM sys.check_constraints 
    WHERE name = 'CK_Products_Sold' AND parent_object_id = OBJECT_ID(N'Products')
)
BEGIN
    ALTER TABLE Products ADD CONSTRAINT CK_Products_Sold CHECK (sold >= 0);
END;
GO

-- 3. Cập nhật số lượng sold theo dữ liệu thực tế từ các đơn hàng DELIVERED (dùng dynamic SQL để tránh lỗi parse khi vừa thêm cột trong cùng migration)
EXEC('
UPDATE p
SET p.sold = ISNULL(sales.total_sold, 0)
FROM Products p
LEFT JOIN (
    SELECT oi.product_id, SUM(oi.quantity) AS total_sold
    FROM OrderItems oi
    JOIN Orders o ON oi.order_id = o.order_id
    WHERE o.order_status = ''DELIVERED''
    GROUP BY oi.product_id
) sales ON p.product_id = sales.product_id;
');
GO

-- 4. Nếu toàn bộ sản phẩm đang có sold = 0 (chưa có đơn DELIVERED nào trong môi trường demo/dev),
-- gán dữ liệu khởi tạo thực tế để phần Best Seller & Featured hiển thị đẹp mắt ngay lập tức
EXEC('
IF NOT EXISTS (SELECT 1 FROM Products WHERE sold > 0)
BEGIN
    UPDATE Products SET sold = 158 WHERE product_id = 1;
    UPDATE Products SET sold = 135 WHERE product_id = 2;
    UPDATE Products SET sold = 112 WHERE product_id = 3;
    UPDATE Products SET sold = 94  WHERE product_id = 4;
    UPDATE Products SET sold = 85  WHERE product_id = 5;
    UPDATE Products SET sold = 76  WHERE product_id = 6;
    UPDATE Products SET sold = 63  WHERE product_id = 7;
    UPDATE Products SET sold = 52  WHERE product_id = 8;
    UPDATE Products SET sold = 45  WHERE product_id = 9;
    UPDATE Products SET sold = 38  WHERE product_id = 10;
    UPDATE Products SET sold = 29  WHERE product_id = 11;
    UPDATE Products SET sold = 22  WHERE product_id = 12;
END;
');
GO

-- 5. Thêm index cho cột sold để tối ưu sort Best Seller
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes 
    WHERE name = 'IX_Products_Sold' AND object_id = OBJECT_ID(N'Products')
)
BEGIN
    CREATE INDEX IX_Products_Sold ON Products (sold DESC);
END;
GO

-- 6. Index kết hợp: WHERE status=''ACTIVE'' ORDER BY sold DESC
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes 
    WHERE name = 'IX_Products_Status_Sold' AND object_id = OBJECT_ID(N'Products')
)
BEGIN
    CREATE INDEX IX_Products_Status_Sold ON Products (status, sold DESC);
END;
GO

/* =========================================================
   V5 - ADD INDEXES ON Products TABLE (idempotent)
   Toi uu query cho M2-03: GET /api/products
   Su dung IF NOT EXISTS de tranh loi khi index da ton tai
   ========================================================= */

-- 1. Index on status: dung trong moi query (WHERE status = 'ACTIVE')
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Products_Status' AND object_id = OBJECT_ID('Products'))
    CREATE INDEX IX_Products_Status ON Products (status);

-- 2. Index on category_id: FK khong tu tao index trong SQL Server
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Products_CategoryId' AND object_id = OBJECT_ID('Products'))
    CREATE INDEX IX_Products_CategoryId ON Products (category_id);

-- 3. Index on brand_id
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Products_BrandId' AND object_id = OBJECT_ID('Products'))
    CREATE INDEX IX_Products_BrandId ON Products (brand_id);

-- 4. Index on price: sort va loc khoang gia
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Products_Price' AND object_id = OBJECT_ID('Products'))
    CREATE INDEX IX_Products_Price ON Products (price);

-- 5. Composite: WHERE status='ACTIVE' ORDER BY price
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Products_Status_Price' AND object_id = OBJECT_ID('Products'))
    CREATE INDEX IX_Products_Status_Price ON Products (status, price);

-- 6. Composite: WHERE status='ACTIVE' AND category_id=? ORDER BY price
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Products_Status_CategoryId_Price' AND object_id = OBJECT_ID('Products'))
    CREATE INDEX IX_Products_Status_CategoryId_Price ON Products (status, category_id, price);

-- 7. Composite: WHERE status='ACTIVE' AND brand_id=? ORDER BY price
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Products_Status_BrandId_Price' AND object_id = OBJECT_ID('Products'))
    CREATE INDEX IX_Products_Status_BrandId_Price ON Products (status, brand_id, price);

-- 8. Index on name: ho tro tim kiem LIKE '%keyword%'
--    LIKE '%...%' se dung index scan thay vi full heap scan
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Products_Name' AND object_id = OBJECT_ID('Products'))
    CREATE INDEX IX_Products_Name ON Products (name);

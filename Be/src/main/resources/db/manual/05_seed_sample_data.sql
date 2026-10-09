USE Stationery_Store;
GO

-- 0. Đảm bảo các cột bổ trợ nếu thiếu
IF COL_LENGTH('dbo.Categories', 'updated_at') IS NULL
    ALTER TABLE dbo.Categories ADD updated_at DATETIME2 NULL;
GO

IF COL_LENGTH('dbo.Brands', 'updated_at') IS NULL
    ALTER TABLE dbo.Brands ADD updated_at DATETIME2 NULL;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    PRINT N'=== BẮT ĐẦU NẠP DỮ LIỆU MẪU CHO STATIONERY STORE ===';

    -- ------------------------------------------------------------------------
    -- 1. NẠP TÀI KHOẢN NGƯỜI DÙNG (USERS)
    -- Mật khẩu mặc định: password123 ($2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi)
    -- ------------------------------------------------------------------------
    PRINT N'1. Đang nạp dữ liệu Users...';

    IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE email = 'admin@stationery.vn')
    BEGIN
        INSERT INTO dbo.Users (full_name, email, password_hash, phone, address, is_admin, status, created_at, updated_at)
        VALUES (N'Admin User', 'admin@stationery.vn', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '0901234567', N'Tòa nhà Innovation, CVPM Quang Trung, Q.12, TP.HCM', 1, 'ACTIVE', DATEADD(DAY, -60, SYSDATETIME()), SYSDATETIME());
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE email = 'manager@stationery.vn')
    BEGIN
        INSERT INTO dbo.Users (full_name, email, password_hash, phone, address, is_admin, status, created_at, updated_at)
        VALUES (N'Quản Lý Kho', 'manager@stationery.vn', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '0909888777', N'Số 123 Nguyễn Thị Minh Khai, Q.3, TP.HCM', 1, 'ACTIVE', DATEADD(DAY, -45, SYSDATETIME()), SYSDATETIME());
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE email = 'nguyenvanan@gmail.com')
    BEGIN
        INSERT INTO dbo.Users (full_name, email, password_hash, phone, address, is_admin, status, created_at, updated_at)
        VALUES (N'Nguyễn Văn An', 'nguyenvanan@gmail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '0912345678', N'45 Lê Duẩn, P. Bến Nghé, Quận 1, TP.HCM', 0, 'ACTIVE', DATEADD(DAY, -30, SYSDATETIME()), SYSDATETIME());
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE email = 'tranthib@gmail.com')
    BEGIN
        INSERT INTO dbo.Users (full_name, email, password_hash, phone, address, is_admin, status, created_at, updated_at)
        VALUES (N'Trần Thị Bích', 'tranthib@gmail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '0987654321', N'88 Cầu Giấy, P. Dịch Vọng, Cầu Giấy, Hà Nội', 0, 'ACTIVE', DATEADD(DAY, -20, SYSDATETIME()), SYSDATETIME());
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE email = 'lehoangc@gmail.com')
    BEGIN
        INSERT INTO dbo.Users (full_name, email, password_hash, phone, address, is_admin, status, created_at, updated_at)
        VALUES (N'Lê Hoàng Cường', 'lehoangc@gmail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '0933112233', N'12 Nguyễn Huệ, Quận Hải Châu, TP. Đà Nẵng', 0, 'ACTIVE', DATEADD(DAY, -15, SYSDATETIME()), SYSDATETIME());
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE email = 'phamthid@gmail.com')
    BEGIN
        INSERT INTO dbo.Users (full_name, email, password_hash, phone, address, is_admin, status, created_at, updated_at)
        VALUES (N'Phạm Dung', 'phamthid@gmail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '0977665544', N'56 Trần Phú, TP. Nha Trang, Khánh Hòa', 0, 'ACTIVE', DATEADD(DAY, -10, SYSDATETIME()), SYSDATETIME());
    END

    IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE email = 'vuquange@gmail.com')
    BEGIN
        INSERT INTO dbo.Users (full_name, email, password_hash, phone, address, is_admin, status, created_at, updated_at)
        VALUES (N'Vũ Quang Em', 'vuquange@gmail.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '0944556677', N'102 Điện Biên Phủ, TP. Cần Thơ', 0, 'ACTIVE', DATEADD(DAY, -5, SYSDATETIME()), SYSDATETIME());
    END

    -- ------------------------------------------------------------------------
    -- 2. NẠP DANH MỤC SẢN PHẨM (CATEGORIES)
    -- ------------------------------------------------------------------------
    PRINT N'2. Đang nạp dữ liệu Categories...';

    IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE name = N'Bút & Dụng Cụ Viết')
        INSERT INTO dbo.Categories (name, description, status, created_at, updated_at) VALUES (N'Bút & Dụng Cụ Viết', N'Các loại bút gel, bút bi, bút chì kim, bút highlight cao cấp', 'ACTIVE', SYSDATETIME(), SYSDATETIME());

    IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE name = N'Sổ Tay & Vở Học Sinh')
        INSERT INTO dbo.Categories (name, description, status, created_at, updated_at) VALUES (N'Sổ Tay & Vở Học Sinh', N'Sổ tay bìa da, sổ còng, sổ lò xo, vở ghi chép phong cách Nhật Bản', 'ACTIVE', SYSDATETIME(), SYSDATETIME());

    IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE name = N'Dụng Cụ Mỹ Thuật & Vẽ')
        INSERT INTO dbo.Categories (name, description, status, created_at, updated_at) VALUES (N'Dụng Cụ Mỹ Thuật & Vẽ', N'Màu nước, cọ vẽ, bút vẽ nét, giấy vẽ chuyên dụng', 'ACTIVE', SYSDATETIME(), SYSDATETIME());

    IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE name = N'Bìa Hồ Sơ & Lưu Trữ')
        INSERT INTO dbo.Categories (name, description, status, created_at, updated_at) VALUES (N'Bìa Hồ Sơ & Lưu Trữ', N'Bìa còng, bìa lá, túi clear bag lưu trữ chứng từ công sở', 'ACTIVE', SYSDATETIME(), SYSDATETIME());

    IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE name = N'Phụ Kiện & Quà Tặng')
        INSERT INTO dbo.Categories (name, description, status, created_at, updated_at) VALUES (N'Phụ Kiện & Quà Tặng', N'Băng dính washi tape, ghim kẹp giấy, bookmark trang trí', 'ACTIVE', SYSDATETIME(), SYSDATETIME());

    -- ------------------------------------------------------------------------
    -- 3. NẠP THƯƠNG HIỆU ĐỐI TÁC (BRANDS)
    -- ------------------------------------------------------------------------
    PRINT N'3. Đang nạp dữ liệu Brands...';

    IF NOT EXISTS (SELECT 1 FROM dbo.Brands WHERE name = 'Pilot')
        INSERT INTO dbo.Brands (name, description, status, created_at, updated_at) VALUES ('Pilot', N'Thương hiệu bút viết số 1 Nhật Bản với dòng bút gel G-2, Frixion', 'ACTIVE', SYSDATETIME(), SYSDATETIME());

    IF NOT EXISTS (SELECT 1 FROM dbo.Brands WHERE name = 'Tombow')
        INSERT INTO dbo.Brands (name, description, status, created_at, updated_at) VALUES ('Tombow', N'Nổi tiếng với dòng bút Mono Graph, tẩy và bút lông Brush Pen', 'ACTIVE', SYSDATETIME(), SYSDATETIME());

    IF NOT EXISTS (SELECT 1 FROM dbo.Brands WHERE name = 'Pentel')
        INSERT INTO dbo.Brands (name, description, status, created_at, updated_at) VALUES ('Pentel', N'Dẫn đầu thế giới về bút chì kim, ruột chì và màu vẽ mỹ thuật', 'ACTIVE', SYSDATETIME(), SYSDATETIME());

    IF NOT EXISTS (SELECT 1 FROM dbo.Brands WHERE name = 'Midori')
        INSERT INTO dbo.Brands (name, description, status, created_at, updated_at) VALUES ('Midori', N'Thương hiệu sổ da cao cấp phong cách tối giản Nhật Bản MD Paper', 'ACTIVE', SYSDATETIME(), SYSDATETIME());

    IF NOT EXISTS (SELECT 1 FROM dbo.Brands WHERE name = 'Kokuyo')
        INSERT INTO dbo.Brands (name, description, status, created_at, updated_at) VALUES ('Kokuyo', N'Tập đoàn văn phòng phẩm hàng đầu với dòng vở Campus nổi tiếng', 'ACTIVE', SYSDATETIME(), SYSDATETIME());

    IF NOT EXISTS (SELECT 1 FROM dbo.Brands WHERE name = N'Thiên Long')
        INSERT INTO dbo.Brands (name, description, status, created_at, updated_at) VALUES (N'Thiên Long', N'Thương hiệu văn phòng phẩm quốc dân Việt Nam', 'ACTIVE', SYSDATETIME(), SYSDATETIME());

    IF NOT EXISTS (SELECT 1 FROM dbo.Brands WHERE name = 'Zebra')
        INSERT INTO dbo.Brands (name, description, status, created_at, updated_at) VALUES ('Zebra', N'Dòng bút Sarasa Clip êm mực, kháng nước vượt trội', 'ACTIVE', SYSDATETIME(), SYSDATETIME());

    -- ------------------------------------------------------------------------
    -- 4. NẠP SẢN PHẨM (PRODUCTS) - CÓ SẢN PHẨM STOCK <= 5 ĐỂ HIỂN THỊ CẢNH BÁO TỒN KHO
    -- ------------------------------------------------------------------------
    PRINT N'4. Đang nạp dữ liệu Products...';

    DECLARE @CatBut INT = (SELECT TOP 1 category_id FROM dbo.Categories WHERE name LIKE N'%Bút%');
    DECLARE @CatSo INT = (SELECT TOP 1 category_id FROM dbo.Categories WHERE name LIKE N'%Sổ%');
    DECLARE @CatVe INT = (SELECT TOP 1 category_id FROM dbo.Categories WHERE name LIKE N'%Mỹ Thuật%');
    DECLARE @CatBia INT = (SELECT TOP 1 category_id FROM dbo.Categories WHERE name LIKE N'%Bìa%');
    DECLARE @CatPK INT = (SELECT TOP 1 category_id FROM dbo.Categories WHERE name LIKE N'%Phụ Kiện%');

    DECLARE @BrandPilot INT = (SELECT TOP 1 brand_id FROM dbo.Brands WHERE name = 'Pilot');
    DECLARE @BrandTombow INT = (SELECT TOP 1 brand_id FROM dbo.Brands WHERE name = 'Tombow');
    DECLARE @BrandPentel INT = (SELECT TOP 1 brand_id FROM dbo.Brands WHERE name = 'Pentel');
    DECLARE @BrandMidori INT = (SELECT TOP 1 brand_id FROM dbo.Brands WHERE name = 'Midori');
    DECLARE @BrandKokuyo INT = (SELECT TOP 1 brand_id FROM dbo.Brands WHERE name = 'Kokuyo');
    DECLARE @BrandThienLong INT = (SELECT TOP 1 brand_id FROM dbo.Brands WHERE name = N'Thiên Long');
    DECLARE @BrandZebra INT = (SELECT TOP 1 brand_id FROM dbo.Brands WHERE name = 'Zebra');

    IF @BrandPilot IS NULL SET @BrandPilot = (SELECT TOP 1 brand_id FROM dbo.Brands);
    IF @BrandTombow IS NULL SET @BrandTombow = @BrandPilot;
    IF @BrandPentel IS NULL SET @BrandPentel = @BrandPilot;
    IF @BrandMidori IS NULL SET @BrandMidori = @BrandPilot;
    IF @BrandKokuyo IS NULL SET @BrandKokuyo = @BrandPilot;
    IF @BrandThienLong IS NULL SET @BrandThienLong = @BrandPilot;
    IF @BrandZebra IS NULL SET @BrandZebra = @BrandPilot;

    IF @CatBut IS NULL SET @CatBut = (SELECT TOP 1 category_id FROM dbo.Categories);
    IF @CatSo IS NULL SET @CatSo = @CatBut;
    IF @CatVe IS NULL SET @CatVe = @CatBut;
    IF @CatBia IS NULL SET @CatBia = @CatBut;
    IF @CatPK IS NULL SET @CatPK = @CatBut;

    -- Bút viết
    IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE sku = 'PLT-G2-05BK')
        INSERT INTO dbo.Products (category_id, brand_id, name, sku, description, price, weight_kg, stock_quantity, image_url, status, created_at, updated_at)
        VALUES (@CatBut, @BrandPilot, N'Bút Gel Pilot G2 0.5mm Mực Đen Cao Cấp', 'PLT-G2-05BK', N'Bút gel mực êm, ngòi 0.5mm trơn mượt, phù hợp ký tên và ghi chép hàng ngày', 32000, 0.020, 3, 'https://images.unsplash.com/photo-1585336261026-778842c67674?w=500', 'ACTIVE', SYSDATETIME(), SYSDATETIME());

    IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE sku = 'ZBR-SRS-05BL')
        INSERT INTO dbo.Products (category_id, brand_id, name, sku, description, price, weight_kg, stock_quantity, image_url, status, created_at, updated_at)
        VALUES (@CatBut, @BrandZebra, N'Bút Gel Zebra Sarasa Clip 0.5mm Xanh Dương', 'ZBR-SRS-05BL', N'Mực gel kháng nước, kẹp bút lò xo tiện lợi gắn vào sổ tay', 25000, 0.020, 45, 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500', 'ACTIVE', SYSDATETIME(), SYSDATETIME());

    IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE sku = 'TMB-MN-05')
        INSERT INTO dbo.Products (category_id, brand_id, name, sku, description, price, weight_kg, stock_quantity, image_url, status, created_at, updated_at)
        VALUES (@CatBut, @BrandTombow, N'Bút Chì Kim Tombow Mono Graph 0.5mm', 'TMB-MN-05', N'Cơ chế lắc để ra chì và khóa chì thông minh, đầu gôm xoay tiện dụng', 85000, 0.030, 2, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500', 'ACTIVE', SYSDATETIME(), SYSDATETIME());

    IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE sku = 'PNT-EPL-05')
        INSERT INTO dbo.Products (category_id, brand_id, name, sku, description, price, weight_kg, stock_quantity, image_url, status, created_at, updated_at)
        VALUES (@CatBut, @BrandPentel, N'Bút Ký Pentel EnerGel Metal 0.5mm Hợp Kim', 'PNT-EPL-05', N'Thân kim loại sang trọng, công nghệ mực khô nhanh không lem tay', 145000, 0.040, 18, 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500', 'ACTIVE', SYSDATETIME(), SYSDATETIME());

    -- Sổ tay
    IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE sku = 'MDR-MD-A5')
        INSERT INTO dbo.Products (category_id, brand_id, name, sku, description, price, weight_kg, stock_quantity, image_url, status, created_at, updated_at)
        VALUES (@CatSo, @BrandMidori, N'Sổ Tay Midori MD Notebook A5 Giấy Kẻ Ô', 'MDR-MD-A5', N'Giấy MD Paper độc quyền không thấm mực, phù hợp viết bút máy', 220000, 0.250, 4, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500', 'ACTIVE', SYSDATETIME(), SYSDATETIME());

    IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE sku = 'KKY-CMP-B5')
        INSERT INTO dbo.Products (category_id, brand_id, name, sku, description, price, weight_kg, stock_quantity, image_url, status, created_at, updated_at)
        VALUES (@CatSo, @BrandKokuyo, N'Combo 5 Vở Kẻ Ngang Kokuyo Campus B5 80 Trang', 'KKY-CMP-B5', N'Giấy láng mịn, định lượng 70gsm chống lóa bảo vệ thị lực học sinh', 75000, 0.600, 120, 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500', 'ACTIVE', SYSDATETIME(), SYSDATETIME());

    -- Dụng cụ mỹ thuật
    IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE sku = 'PNT-WTC-24')
        INSERT INTO dbo.Products (category_id, brand_id, name, sku, description, price, weight_kg, stock_quantity, image_url, status, created_at, updated_at)
        VALUES (@CatVe, @BrandPentel, N'Bộ Màu Nước Pentel Water Colours 24 Màu Tuýp', 'PNT-WTC-24', N'Màu sắc tươi sáng, độ bám cao, hòa tan mịn màng trên giấy mỹ thuật', 185000, 0.350, 30, 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500', 'ACTIVE', SYSDATETIME(), SYSDATETIME());

    IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE sku = 'TMB-ABT-12')
        INSERT INTO dbo.Products (category_id, brand_id, name, sku, description, price, weight_kg, stock_quantity, image_url, status, created_at, updated_at)
        VALUES (@CatVe, @BrandTombow, N'Bộ Bút Lông Tombow Dual Brush Pen 12 Màu Pastel', 'TMB-ABT-12', N'Hai đầu cọ linh hoạt và đầu tròn, chuẩn tone pastel nghệ thuật cao cấp', 390000, 0.200, 1, 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500', 'ACTIVE', SYSDATETIME(), SYSDATETIME());

    -- Bìa hồ sơ & Lưu trữ
    IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE sku = 'TL-FC-A4')
        INSERT INTO dbo.Products (category_id, brand_id, name, sku, description, price, weight_kg, stock_quantity, image_url, status, created_at, updated_at)
        VALUES (@CatBia, @BrandThienLong, N'Bìa Còng Bật Thiên Long A4 7cm Lưu Hồ Sơ', 'TL-FC-A4', N'Bìa nhựa si cao cấp, còng chắc chắn chứa tới 500 tờ A4', 42000, 0.400, 85, 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500', 'ACTIVE', SYSDATETIME(), SYSDATETIME());

    -- Phụ kiện & Quà tặng
    IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE sku = 'MDR-CLP-BRS')
        INSERT INTO dbo.Products (category_id, brand_id, name, sku, description, price, weight_kg, stock_quantity, image_url, status, created_at, updated_at)
        VALUES (@CatPK, @BrandMidori, N'Kẹp Sách Midori Brass Clip Đồng Thau Cổ Điển', 'MDR-CLP-BRS', N'Chất liệu đồng nguyên khối tinh xảo tạo dấu ấn phong cách vintage', 160000, 0.050, 5, 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500', 'ACTIVE', SYSDATETIME(), SYSDATETIME());

    -- ------------------------------------------------------------------------
    -- 5. NẠP MÃ GIẢM GIÁ (VOUCHERS)
    -- ------------------------------------------------------------------------
    PRINT N'5. Đang nạp dữ liệu Vouchers...';

    IF NOT EXISTS (SELECT 1 FROM dbo.Vouchers WHERE code = 'CHAOBANMOI')
        INSERT INTO dbo.Vouchers (code, discount_percent, max_discount, min_order_amount, start_date, end_date, usage_limit, used_count, is_active, status, created_at, updated_at)
        VALUES ('CHAOBANMOI', 10.00, 30000, 100000, DATEADD(DAY, -30, SYSDATETIME()), DATEADD(DAY, 60, SYSDATETIME()), 500, 14, 1, 'ACTIVE', SYSDATETIME(), SYSDATETIME());

    IF NOT EXISTS (SELECT 1 FROM dbo.Vouchers WHERE code = 'SUMMERSALE')
        INSERT INTO dbo.Vouchers (code, discount_percent, max_discount, min_order_amount, start_date, end_date, usage_limit, used_count, is_active, status, created_at, updated_at)
        VALUES ('SUMMERSALE', 15.00, 50000, 200000, DATEADD(DAY, -15, SYSDATETIME()), DATEADD(DAY, 30, SYSDATETIME()), 200, 28, 1, 'ACTIVE', SYSDATETIME(), SYSDATETIME());

    IF NOT EXISTS (SELECT 1 FROM dbo.Vouchers WHERE code = 'VIPSTATIONERY')
        INSERT INTO dbo.Vouchers (code, discount_percent, max_discount, min_order_amount, start_date, end_date, usage_limit, used_count, is_active, status, created_at, updated_at)
        VALUES ('VIPSTATIONERY', 20.00, 100000, 500000, DATEADD(DAY, -60, SYSDATETIME()), DATEADD(DAY, 90, SYSDATETIME()), 100, 5, 1, 'ACTIVE', SYSDATETIME(), SYSDATETIME());

    -- ------------------------------------------------------------------------
    -- 6. NẠP ĐƠN HÀNG (ORDERS) & CHI TIẾT ĐƠN HÀNG (ORDERITEMS)
    -- ------------------------------------------------------------------------
    PRINT N'6. Đang nạp dữ liệu Orders và OrderItems...';

    DECLARE @UserAn INT = (SELECT TOP 1 user_id FROM dbo.Users WHERE email = 'nguyenvanan@gmail.com');
    DECLARE @UserBich INT = (SELECT TOP 1 user_id FROM dbo.Users WHERE email = 'tranthib@gmail.com');
    DECLARE @UserCuong INT = (SELECT TOP 1 user_id FROM dbo.Users WHERE email = 'lehoangc@gmail.com');
    DECLARE @UserDung INT = (SELECT TOP 1 user_id FROM dbo.Users WHERE email = 'phamthid@gmail.com');
    DECLARE @UserEm INT = (SELECT TOP 1 user_id FROM dbo.Users WHERE email = 'vuquange@gmail.com');

    DECLARE @ProdPilotG2 INT = (SELECT TOP 1 product_id FROM dbo.Products WHERE sku = 'PLT-G2-05BK');
    DECLARE @ProdSarasa INT = (SELECT TOP 1 product_id FROM dbo.Products WHERE sku = 'ZBR-SRS-05BL');
    DECLARE @ProdMono INT = (SELECT TOP 1 product_id FROM dbo.Products WHERE sku = 'TMB-MN-05');
    DECLARE @ProdPentelMetal INT = (SELECT TOP 1 product_id FROM dbo.Products WHERE sku = 'PNT-EPL-05');
    DECLARE @ProdMidoriA5 INT = (SELECT TOP 1 product_id FROM dbo.Products WHERE sku = 'MDR-MD-A5');
    DECLARE @ProdCampus INT = (SELECT TOP 1 product_id FROM dbo.Products WHERE sku = 'KKY-CMP-B5');
    DECLARE @ProdWaterColor INT = (SELECT TOP 1 product_id FROM dbo.Products WHERE sku = 'PNT-WTC-24');
    DECLARE @ProdTombowBrush INT = (SELECT TOP 1 product_id FROM dbo.Products WHERE sku = 'TMB-ABT-12');
    DECLARE @ProdBiaThienLong INT = (SELECT TOP 1 product_id FROM dbo.Products WHERE sku = 'TL-FC-A4');

    IF @ProdPilotG2 IS NULL SET @ProdPilotG2 = (SELECT TOP 1 product_id FROM dbo.Products);
    IF @ProdSarasa IS NULL SET @ProdSarasa = @ProdPilotG2;
    IF @ProdMono IS NULL SET @ProdMono = @ProdPilotG2;
    IF @ProdPentelMetal IS NULL SET @ProdPentelMetal = @ProdPilotG2;
    IF @ProdMidoriA5 IS NULL SET @ProdMidoriA5 = @ProdPilotG2;
    IF @ProdCampus IS NULL SET @ProdCampus = @ProdPilotG2;
    IF @ProdWaterColor IS NULL SET @ProdWaterColor = @ProdPilotG2;
    IF @ProdTombowBrush IS NULL SET @ProdTombowBrush = @ProdPilotG2;
    IF @ProdBiaThienLong IS NULL SET @ProdBiaThienLong = @ProdPilotG2;

    DECLARE @NewOrderId INT;

    -- [Đơn 1] Hôm nay (Day 0) - DELIVERED - 339.000₫
    INSERT INTO dbo.Orders (user_id, voucher_id, subtotal, discount_amount, shipping_method, total_weight_kg, shipping_fee, total_cost, shipping_address, phone, order_status, note, created_at, updated_at)
    VALUES (@UserAn, NULL, 319000, 0, 'STANDARD', 0.850, 20000, 339000, N'45 Lê Duẩn, P. Bến Nghé, Quận 1, TP.HCM', '0912345678', 'DELIVERED', N'Giao giờ hành chính giúp tôi', SYSDATETIME(), SYSDATETIME());
    SET @NewOrderId = SCOPE_IDENTITY();
    INSERT INTO dbo.OrderItems (order_id, product_id, product_name, unit_price, quantity, subtotal)
    VALUES (@NewOrderId, @ProdMidoriA5, N'Sổ Tay Midori MD Notebook A5 Giấy Kẻ Ô', 220000, 1, 220000),
           (@NewOrderId, @ProdPilotG2, N'Bút Gel Pilot G2 0.5mm Mực Đen Cao Cấp', 32000, 2, 64000),
           (@NewOrderId, @ProdSarasa, N'Bút Gel Zebra Sarasa Clip 0.5mm Xanh Dương', 25000, 1, 25000);

    -- [Đơn 2] Hôm qua (Day -1) - DELIVERED - 205.000₫
    INSERT INTO dbo.Orders (user_id, voucher_id, subtotal, discount_amount, shipping_method, total_weight_kg, shipping_fee, total_cost, shipping_address, phone, order_status, note, created_at, updated_at)
    VALUES (@UserBich, NULL, 185000, 0, 'EXPRESS', 0.600, 20000, 205000, N'88 Cầu Giấy, P. Dịch Vọng, Cầu Giấy, Hà Nội', '0987654321', 'DELIVERED', N'Hàng dễ vỡ, vui lòng đóng gói cẩn thận', DATEADD(DAY, -1, SYSDATETIME()), DATEADD(DAY, -1, SYSDATETIME()));
    SET @NewOrderId = SCOPE_IDENTITY();
    INSERT INTO dbo.OrderItems (order_id, product_id, product_name, unit_price, quantity, subtotal)
    VALUES (@NewOrderId, @ProdWaterColor, N'Bộ Màu Nước Pentel Water Colours 24 Màu Tuýp', 185000, 1, 185000);

    -- [Đơn 3] 2 ngày trước (Day -2) - SHIPPING - 485.000₫
    INSERT INTO dbo.Orders (user_id, voucher_id, subtotal, discount_amount, shipping_method, total_weight_kg, shipping_fee, total_cost, shipping_address, phone, order_status, note, created_at, updated_at)
    VALUES (@UserCuong, NULL, 475000, 0, 'STANDARD', 1.200, 10000, 485000, N'12 Nguyễn Huệ, Quận Hải Châu, TP. Đà Nẵng', '0933112233', 'SHIPPING', N'Gọi trước khi giao 15 phút', DATEADD(DAY, -2, SYSDATETIME()), DATEADD(DAY, -2, SYSDATETIME()));
    SET @NewOrderId = SCOPE_IDENTITY();
    INSERT INTO dbo.OrderItems (order_id, product_id, product_name, unit_price, quantity, subtotal)
    VALUES (@NewOrderId, @ProdTombowBrush, N'Bộ Bút Lông Tombow Dual Brush Pen 12 Màu Pastel', 390000, 1, 390000),
           (@NewOrderId, @ProdMono, N'Bút Chì Kim Tombow Mono Graph 0.5mm', 85000, 1, 85000);

    -- [Đơn 4] 3 ngày trước (Day -3) - DELIVERED - 245.000₫
    INSERT INTO dbo.Orders (user_id, voucher_id, subtotal, discount_amount, shipping_method, total_weight_kg, shipping_fee, total_cost, shipping_address, phone, order_status, note, created_at, updated_at)
    VALUES (@UserDung, NULL, 225000, 0, 'STANDARD', 1.500, 20000, 245000, N'56 Trần Phú, TP. Nha Trang, Khánh Hòa', '0977665544', 'DELIVERED', N'', DATEADD(DAY, -3, SYSDATETIME()), DATEADD(DAY, -3, SYSDATETIME()));
    SET @NewOrderId = SCOPE_IDENTITY();
    INSERT INTO dbo.OrderItems (order_id, product_id, product_name, unit_price, quantity, subtotal)
    VALUES (@NewOrderId, @ProdCampus, N'Combo 5 Vở Kẻ Ngang Kokuyo Campus B5 80 Trang', 75000, 3, 225000);

    -- [Đơn 5] 4 ngày trước (Day -4) - CONFIRMED - 165.000₫
    INSERT INTO dbo.Orders (user_id, voucher_id, subtotal, discount_amount, shipping_method, total_weight_kg, shipping_fee, total_cost, shipping_address, phone, order_status, note, created_at, updated_at)
    VALUES (@UserEm, NULL, 145000, 0, 'STANDARD', 0.350, 20000, 165000, N'102 Điện Biên Phủ, TP. Cần Thơ', '0944556677', 'CONFIRMED', N'Cần gấp trong tuần', DATEADD(DAY, -4, SYSDATETIME()), DATEADD(DAY, -4, SYSDATETIME()));
    SET @NewOrderId = SCOPE_IDENTITY();
    INSERT INTO dbo.OrderItems (order_id, product_id, product_name, unit_price, quantity, subtotal)
    VALUES (@NewOrderId, @ProdPentelMetal, N'Bút Ký Pentel EnerGel Metal 0.5mm Hợp Kim', 145000, 1, 145000);

    -- [Đơn 6] 5 ngày trước (Day -5) - DELIVERED - 404.000₫
    INSERT INTO dbo.Orders (user_id, voucher_id, subtotal, discount_amount, shipping_method, total_weight_kg, shipping_fee, total_cost, shipping_address, phone, order_status, note, created_at, updated_at)
    VALUES (@UserAn, NULL, 384000, 0, 'EXPRESS', 0.900, 20000, 404000, N'45 Lê Duẩn, P. Bến Nghé, Quận 1, TP.HCM', '0912345678', 'DELIVERED', N'', DATEADD(DAY, -5, SYSDATETIME()), DATEADD(DAY, -5, SYSDATETIME()));
    SET @NewOrderId = SCOPE_IDENTITY();
    INSERT INTO dbo.OrderItems (order_id, product_id, product_name, unit_price, quantity, subtotal)
    VALUES (@NewOrderId, @ProdPilotG2, N'Bút Gel Pilot G2 0.5mm Mực Đen Cao Cấp', 32000, 7, 224000),
           (@NewOrderId, @ProdMidoriA5, N'Sổ Tay Midori MD Notebook A5 Giấy Kẻ Ô', 160000, 1, 160000);

    -- [Đơn 7] 6 ngày trước (Day -6) - PENDING - 105.000₫
    INSERT INTO dbo.Orders (user_id, voucher_id, subtotal, discount_amount, shipping_method, total_weight_kg, shipping_fee, total_cost, shipping_address, phone, order_status, note, created_at, updated_at)
    VALUES (@UserBich, NULL, 85000, 0, 'STANDARD', 0.200, 20000, 105000, N'88 Cầu Giấy, P. Dịch Vọng, Cầu Giấy, Hà Nội', '0987654321', 'PENDING', N'Chờ xác nhận từ khách', DATEADD(DAY, -6, SYSDATETIME()), DATEADD(DAY, -6, SYSDATETIME()));
    SET @NewOrderId = SCOPE_IDENTITY();
    INSERT INTO dbo.OrderItems (order_id, product_id, product_name, unit_price, quantity, subtotal)
    VALUES (@NewOrderId, @ProdMono, N'Bút Chì Kim Tombow Mono Graph 0.5mm', 85000, 1, 85000);

    -- [Đơn 8] 12 ngày trước (Day -12) - DELIVERED - 610.000₫
    INSERT INTO dbo.Orders (user_id, voucher_id, subtotal, discount_amount, shipping_method, total_weight_kg, shipping_fee, total_cost, shipping_address, phone, order_status, note, created_at, updated_at)
    VALUES (@UserCuong, NULL, 590000, 0, 'STANDARD', 1.800, 20000, 610000, N'12 Nguyễn Huệ, Quận Hải Châu, TP. Đà Nẵng', '0933112233', 'DELIVERED', N'', DATEADD(DAY, -12, SYSDATETIME()), DATEADD(DAY, -12, SYSDATETIME()));
    SET @NewOrderId = SCOPE_IDENTITY();
    INSERT INTO dbo.OrderItems (order_id, product_id, product_name, unit_price, quantity, subtotal)
    VALUES (@NewOrderId, @ProdTombowBrush, N'Bộ Bút Lông Tombow Dual Brush Pen 12 Màu Pastel', 390000, 1, 390000),
           (@NewOrderId, @ProdMidoriA5, N'Sổ Tay Midori MD Notebook A5 Giấy Kẻ Ô', 200000, 1, 200000);

    -- [Đơn 9] 18 ngày trước (Day -18) - DELIVERED - 516.000₫
    INSERT INTO dbo.Orders (user_id, voucher_id, subtotal, discount_amount, shipping_method, total_weight_kg, shipping_fee, total_cost, shipping_address, phone, order_status, note, created_at, updated_at)
    VALUES (@UserDung, NULL, 496000, 0, 'STANDARD', 2.000, 20000, 516000, N'56 Trần Phú, TP. Nha Trang, Khánh Hòa', '0977665544', 'DELIVERED', N'', DATEADD(DAY, -18, SYSDATETIME()), DATEADD(DAY, -18, SYSDATETIME()));
    SET @NewOrderId = SCOPE_IDENTITY();
    INSERT INTO dbo.OrderItems (order_id, product_id, product_name, unit_price, quantity, subtotal)
    VALUES (@NewOrderId, @ProdWaterColor, N'Bộ Màu Nước Pentel Water Colours 24 Màu Tuýp', 185000, 2, 370000),
           (@NewOrderId, @ProdBiaThienLong, N'Bìa Còng Bật Thiên Long A4 7cm Lưu Hồ Sơ', 42000, 3, 126000);

    -- [Đơn 10] 25 ngày trước (Day -25) - CANCELLED - 95.000₫
    INSERT INTO dbo.Orders (user_id, voucher_id, subtotal, discount_amount, shipping_method, total_weight_kg, shipping_fee, total_cost, shipping_address, phone, order_status, note, created_at, updated_at)
    VALUES (@UserEm, NULL, 75000, 0, 'STANDARD', 0.500, 20000, 95000, N'102 Điện Biên Phủ, TP. Cần Thơ', '0944556677', 'CANCELLED', N'Khách đổi ý đặt sản phẩm khác', DATEADD(DAY, -25, SYSDATETIME()), DATEADD(DAY, -25, SYSDATETIME()));
    SET @NewOrderId = SCOPE_IDENTITY();
    INSERT INTO dbo.OrderItems (order_id, product_id, product_name, unit_price, quantity, subtotal)
    VALUES (@NewOrderId, @ProdSarasa, N'Bút Gel Zebra Sarasa Clip 0.5mm Xanh Dương', 25000, 3, 75000);

    -- [Đơn 11] 45 ngày trước (Tháng trước) - DELIVERED - 880.000₫
    INSERT INTO dbo.Orders (user_id, voucher_id, subtotal, discount_amount, shipping_method, total_weight_kg, shipping_fee, total_cost, shipping_address, phone, order_status, note, created_at, updated_at)
    VALUES (@UserAn, NULL, 860000, 0, 'STANDARD', 2.500, 20000, 880000, N'45 Lê Duẩn, P. Bến Nghé, Quận 1, TP.HCM', '0912345678', 'DELIVERED', N'', DATEADD(DAY, -45, SYSDATETIME()), DATEADD(DAY, -45, SYSDATETIME()));
    SET @NewOrderId = SCOPE_IDENTITY();
    INSERT INTO dbo.OrderItems (order_id, product_id, product_name, unit_price, quantity, subtotal)
    VALUES (@NewOrderId, @ProdTombowBrush, N'Bộ Bút Lông Tombow Dual Brush Pen 12 Màu Pastel', 390000, 2, 780000),
           (@NewOrderId, @ProdMono, N'Bút Chì Kim Tombow Mono Graph 0.5mm', 80000, 1, 80000);

    -- [Đơn 12] 75 ngày trước (2 tháng trước) - DELIVERED - 1.250.000₫
    INSERT INTO dbo.Orders (user_id, voucher_id, subtotal, discount_amount, shipping_method, total_weight_kg, shipping_fee, total_cost, shipping_address, phone, order_status, note, created_at, updated_at)
    VALUES (@UserBich, NULL, 1230000, 0, 'STANDARD', 3.200, 20000, 1250000, N'88 Cầu Giấy, P. Dịch Vọng, Cầu Giấy, Hà Nội', '0987654321', 'DELIVERED', N'', DATEADD(DAY, -75, SYSDATETIME()), DATEADD(DAY, -75, SYSDATETIME()));
    SET @NewOrderId = SCOPE_IDENTITY();
    INSERT INTO dbo.OrderItems (order_id, product_id, product_name, unit_price, quantity, subtotal)
    VALUES (@NewOrderId, @ProdMidoriA5, N'Sổ Tay Midori MD Notebook A5 Giấy Kẻ Ô', 220000, 4, 880000),
           (@NewOrderId, @ProdWaterColor, N'Bộ Màu Nước Pentel Water Colours 24 Màu Tuýp', 185000, 2, 370000);

    COMMIT TRANSACTION;
    PRINT N'=== HOÀN TẤT NẠP DỮ LIỆU MẪU THÀNH CÔNG! ===';
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    PRINT N'LỖI: ' + ERROR_MESSAGE();
    THROW;
END CATCH;
GO

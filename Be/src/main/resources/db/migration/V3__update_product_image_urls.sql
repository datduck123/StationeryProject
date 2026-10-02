/* =========================================================
   V3 - Update product imageUrl to match local frontend assets
   Map từng sản phẩm với ảnh phù hợp nhất
   ========================================================= */

-- ID 1: Thien Long TL-027 Ballpoint Pen → hộp bút gỗ
UPDATE Products SET image_url = '/assets/media/products/product-7.png'
WHERE product_id = 1;

-- ID 2: Pentel EnerGel Gel Pen → bút + pencil case
UPDATE Products SET image_url = '/assets/media/products/product-4.png'
WHERE product_id = 2;

-- ID 3: Maruman A5 Notebook → bộ văn phòng phẩm có vở
UPDATE Products SET image_url = '/assets/media/products/product-2.png'
WHERE product_id = 3;

-- ID 4: Deli Sticky Notes → clipboard + bút (giấy note)
UPDATE Products SET image_url = '/assets/media/products/product-9.png'
WHERE product_id = 4;

-- ID 5: Stabilo Highlighter Set → bộ bút màu
UPDATE Products SET image_url = '/assets/media/products/product-5.png'
WHERE product_id = 5;

-- ID 6: Deli Office Scissors → dụng cụ cắt
UPDATE Products SET image_url = '/assets/media/products/product-6.png'
WHERE product_id = 6;

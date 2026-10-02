/* =========================================================
   V4 - Standardize product names, descriptions, and image URLs
   Khớp 100% hình ảnh và tên sản phẩm thực tế
   ========================================================= */

-- ID 1: Bút bi Thiên Long TL-027 -> Cây bút cắm bàn gỗ cao cấp
UPDATE Products 
SET name = N'Thien Long TL-027 Ballpoint Pen',
    image_url = '/assets/media/products/product-7.png',
    description = N'Bút bi cao cấp Thiên Long nét viết êm trơn, mực đậm rõ nét, thiết kế kèm đế cắm gỗ để bàn sang trọng.'
WHERE product_id = 1;

-- ID 2: Bút gel kỹ thuật Pentel EnerGel -> Bộ bút kim loại bấm & gôm tẩy kẹp giấy
UPDATE Products 
SET name = N'Pentel EnerGel Gel Pen Set',
    image_url = '/assets/media/products/product-10.png',
    description = N'Bộ bút gel kỹ thuật Pentel EnerGel cao cấp mực mau khô, nét êm ái kèm gôm tẩy và kẹp giấy chuyên dụng.'
WHERE product_id = 2;

-- ID 3: Sổ tay Maruman A5 -> Chồng sổ tay A5 nhiều màu có nẹp bút
UPDATE Products 
SET name = N'Maruman A5 Hardcover Notebook',
    image_url = '/assets/media/products/product-11.png',
    description = N'Sổ tay Maruman bìa cứng khổ A5 giấy Nhật Bản cao cấp chống nhòe mực, kèm dây đánh dấu trang và bút.'
WHERE product_id = 3;

-- ID 4: Giấy ghi chú & Bìa kẹp tài liệu Deli -> Bìa kẹp hồ sơ A4 kèm giấy note và bút
UPDATE Products 
SET name = N'Deli Document Clipboard & Notes',
    image_url = '/assets/media/products/product-9.png',
    description = N'Bìa kẹp tài liệu A4 Deli chắc chắn kết hợp tập giấy ghi chép tiện lợi và bút ký văn phòng.'
WHERE product_id = 4;

-- ID 5: Bộ bút dạ quang Stabilo Highlighter -> Túi bút đựng bộ bút dạ quang nhiều màu sắc
UPDATE Products 
SET name = N'Stabilo Boss Pastel Highlighter Set',
    image_url = '/assets/media/products/product-4.png',
    description = N'Bộ bút dạ quang highlight Stabilo Boss nhiều màu sắc rực rỡ, highlight chữ sắc nét kèm túi đựng bút thời trang.'
WHERE product_id = 5;

-- ID 6: Máy dập lỗ 2 lỗ Deli màu xanh -> Khớp hoàn toàn với ảnh product-6.png
UPDATE Products 
SET name = N'Deli Heavy-Duty Desktop Puncher',
    image_url = '/assets/media/products/product-6.png',
    description = N'Máy dập lỗ 2 lỗ để bàn Deli màu xanh chuyên dụng, cơ chế trợ lực dập nhẹ tay, công suất dập tối đa 30 tờ.'
WHERE product_id = 6;

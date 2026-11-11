/* =========================================================
   V2 - Add updated_at column to Categories and Brands
   Fix: Entity có field updatedAt nhưng DB thiếu cột này
   ========================================================= */

ALTER TABLE Categories
    ADD updated_at DATETIME2 NULL;

ALTER TABLE Brands
    ADD updated_at DATETIME2 NULL;

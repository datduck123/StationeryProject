IF OBJECT_ID(N'dbo.categories', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.categories (
        category_id BIGINT IDENTITY(1,1) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(255),
        created_at DATETIME2 NOT NULL,
        updated_at DATETIME2
    );
END;

IF OBJECT_ID(N'dbo.brands', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.brands (
        brand_id BIGINT IDENTITY(1,1) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(255),
        created_at DATETIME2 NOT NULL,
        updated_at DATETIME2
    );
END;

IF OBJECT_ID(N'dbo.products', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.products (
        product_id BIGINT IDENTITY(1,1) PRIMARY KEY,
        category_id BIGINT NOT NULL,
        brand_id BIGINT NOT NULL,
        sku VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(18,2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        description NVARCHAR(MAX),
        image_url VARCHAR(255),
        status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        created_at DATETIME2 NOT NULL,
        updated_at DATETIME2,
        CONSTRAINT fk_products_categories FOREIGN KEY (category_id) REFERENCES categories(category_id),
        CONSTRAINT fk_products_brands FOREIGN KEY (brand_id) REFERENCES brands(brand_id)
    );
END;

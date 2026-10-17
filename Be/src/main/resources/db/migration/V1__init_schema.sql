/* =========================================================
   V1 - FULL SCHEMA (khớp với DB thực tế)
   Flyway sẽ baseline tại V1, nên file này không thực sự
   chạy lại - chỉ để Flyway track history.
   ========================================================= */

CREATE TABLE Users (
    user_id       INT IDENTITY(1,1) PRIMARY KEY,
    full_name     NVARCHAR(100)  NOT NULL,
    email         VARCHAR(150)   NOT NULL,
    password_hash VARCHAR(255)   NOT NULL,
    phone         VARCHAR(20)    NULL,
    address       NVARCHAR(255)  NULL,
    is_admin      BIT            NOT NULL CONSTRAINT DF_Users_IsAdmin    DEFAULT 0,
    status        VARCHAR(20)    NOT NULL,
    created_at    DATETIME2      NOT NULL CONSTRAINT DF_Users_CreatedAt  DEFAULT SYSDATETIME(),
    updated_at    DATETIME2      NOT NULL CONSTRAINT DF_Users_UpdatedAt  DEFAULT SYSDATETIME(),
    CONSTRAINT UQ_Users_Email   UNIQUE (email),
    CONSTRAINT CK_Users_Status  CHECK  (status IN ('ACTIVE','INACTIVE','BLOCKED'))
);

CREATE TABLE Categories (
    category_id INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100) NOT NULL,
    description NVARCHAR(500) NULL,
    status      VARCHAR(20)   NOT NULL CONSTRAINT DF_Categories_Status   DEFAULT 'ACTIVE',
    created_at  DATETIME2     NOT NULL CONSTRAINT DF_Categories_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT UQ_Categories_Name   UNIQUE (name),
    CONSTRAINT CK_Categories_Status CHECK  (status IN ('ACTIVE','INACTIVE'))
);

CREATE TABLE Brands (
    brand_id    INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100) NOT NULL,
    description NVARCHAR(500) NULL,
    status      VARCHAR(20)   NOT NULL CONSTRAINT DF_Brands_Status   DEFAULT 'ACTIVE',
    created_at  DATETIME2     NOT NULL CONSTRAINT DF_Brands_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT UQ_Brands_Name   UNIQUE (name),
    CONSTRAINT CK_Brands_Status CHECK  (status IN ('ACTIVE','INACTIVE'))
);

CREATE TABLE Products (
    product_id     INT IDENTITY(1,1) PRIMARY KEY,
    category_id    INT            NOT NULL,
    brand_id       INT            NOT NULL,
    name           NVARCHAR(200)  NOT NULL,
    sku            VARCHAR(50)    NOT NULL,
    description    NVARCHAR(1000) NULL,
    price          DECIMAL(18,2)  NOT NULL,
    weight_kg      DECIMAL(10,3)  NOT NULL,
    stock_quantity INT            NOT NULL CONSTRAINT DF_Products_Stock   DEFAULT 0,
    image_url      VARCHAR(500)   NULL,
    status         VARCHAR(20)    NOT NULL CONSTRAINT DF_Products_Status  DEFAULT 'ACTIVE',
    created_at     DATETIME2      NOT NULL CONSTRAINT DF_Products_CreatedAt DEFAULT SYSDATETIME(),
    updated_at     DATETIME2      NOT NULL CONSTRAINT DF_Products_UpdatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT UQ_Products_SKU        UNIQUE (sku),
    CONSTRAINT FK_Products_Categories FOREIGN KEY (category_id) REFERENCES Categories(category_id),
    CONSTRAINT FK_Products_Brands     FOREIGN KEY (brand_id)    REFERENCES Brands(brand_id),
    CONSTRAINT CK_Products_Price      CHECK (price          >= 0),
    CONSTRAINT CK_Products_Weight     CHECK (weight_kg      >  0),
    CONSTRAINT CK_Products_Stock      CHECK (stock_quantity >= 0),
    CONSTRAINT CK_Products_Status     CHECK (status IN ('ACTIVE','INACTIVE'))
);

CREATE TABLE CartItems (
    cart_item_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id      INT       NOT NULL,
    product_id   INT       NOT NULL,
    quantity     INT       NOT NULL,
    created_at   DATETIME2 NOT NULL CONSTRAINT DF_CartItems_CreatedAt DEFAULT SYSDATETIME(),
    updated_at   DATETIME2 NOT NULL CONSTRAINT DF_CartItems_UpdatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_CartItems_Users    FOREIGN KEY (user_id)    REFERENCES Users(user_id)    ON DELETE CASCADE,
    CONSTRAINT FK_CartItems_Products FOREIGN KEY (product_id) REFERENCES Products(product_id),
    CONSTRAINT CK_CartItems_Quantity CHECK (quantity > 0),
    CONSTRAINT UQ_CartItems_User_Product UNIQUE (user_id, product_id)
);

CREATE TABLE Vouchers (
    voucher_id       INT IDENTITY(1,1) PRIMARY KEY,
    code             VARCHAR(50)   NOT NULL,
    discount_amount  DECIMAL(18,2) NOT NULL,
    min_order_amount DECIMAL(18,2) NOT NULL CONSTRAINT DF_Vouchers_MinOrder  DEFAULT 0,
    start_date       DATETIME2     NOT NULL,
    end_date         DATETIME2     NOT NULL,
    usage_limit      INT           NOT NULL,
    used_count       INT           NOT NULL CONSTRAINT DF_Vouchers_UsedCount DEFAULT 0,
    status           VARCHAR(20)   NOT NULL CONSTRAINT DF_Vouchers_Status    DEFAULT 'ACTIVE',
    created_at       DATETIME2     NOT NULL CONSTRAINT DF_Vouchers_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT UQ_Vouchers_Code       UNIQUE (code),
    CONSTRAINT CK_Vouchers_Discount   CHECK (discount_amount  >  0),
    CONSTRAINT CK_Vouchers_MinOrder   CHECK (min_order_amount >= 0),
    CONSTRAINT CK_Vouchers_UsageLimit CHECK (usage_limit      >  0),
    CONSTRAINT CK_Vouchers_UsedCount  CHECK (used_count >= 0 AND used_count <= usage_limit),
    CONSTRAINT CK_Vouchers_Date       CHECK (end_date > start_date),
    CONSTRAINT CK_Vouchers_Status     CHECK (status IN ('ACTIVE','INACTIVE'))
);

CREATE TABLE Orders (
    order_id         INT IDENTITY(1,1) PRIMARY KEY,
    user_id          INT            NOT NULL,
    voucher_id       INT            NULL,
    subtotal         DECIMAL(18,2)  NOT NULL,
    discount_amount  DECIMAL(18,2)  NOT NULL CONSTRAINT DF_Orders_Discount DEFAULT 0,
    shipping_method  VARCHAR(20)    NOT NULL,
    total_weight_kg  DECIMAL(10,3)  NOT NULL,
    shipping_fee     DECIMAL(18,2)  NOT NULL,
    total_cost       DECIMAL(18,2)  NOT NULL,
    shipping_address NVARCHAR(255)  NOT NULL,
    phone            VARCHAR(20)    NOT NULL,
    order_status     VARCHAR(20)    NOT NULL CONSTRAINT DF_Orders_Status   DEFAULT 'PENDING',
    note             NVARCHAR(500)  NULL,
    created_at       DATETIME2      NOT NULL CONSTRAINT DF_Orders_CreatedAt DEFAULT SYSDATETIME(),
    updated_at       DATETIME2      NOT NULL CONSTRAINT DF_Orders_UpdatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Orders_Users        FOREIGN KEY (user_id)    REFERENCES Users(user_id),
    CONSTRAINT FK_Orders_Vouchers     FOREIGN KEY (voucher_id) REFERENCES Vouchers(voucher_id),
    CONSTRAINT CK_Orders_Subtotal     CHECK (subtotal        >= 0),
    CONSTRAINT CK_Orders_Discount     CHECK (discount_amount >= 0),
    CONSTRAINT CK_Orders_Weight       CHECK (total_weight_kg >  0),
    CONSTRAINT CK_Orders_ShippingFee  CHECK (shipping_fee    >= 0),
    CONSTRAINT CK_Orders_TotalCost    CHECK (total_cost      >= 0),
    CONSTRAINT CK_Orders_ShippingMethod CHECK (shipping_method IN ('STANDARD','EXPRESS')),
    CONSTRAINT CK_Orders_Status       CHECK (order_status IN ('PENDING','CONFIRMED','SHIPPING','DELIVERED','CANCELLED'))
);

CREATE TABLE OrderItems (
    order_item_id INT IDENTITY(1,1) PRIMARY KEY,
    order_id      INT            NOT NULL,
    product_id    INT            NOT NULL,
    product_name  NVARCHAR(200)  NOT NULL,
    unit_price    DECIMAL(18,2)  NOT NULL,
    quantity      INT            NOT NULL,
    subtotal      DECIMAL(18,2)  NOT NULL,
    CONSTRAINT FK_OrderItems_Orders   FOREIGN KEY (order_id)   REFERENCES Orders(order_id)   ON DELETE CASCADE,
    CONSTRAINT FK_OrderItems_Products FOREIGN KEY (product_id) REFERENCES Products(product_id),
    CONSTRAINT CK_OrderItems_Price    CHECK (unit_price >= 0),
    CONSTRAINT CK_OrderItems_Quantity CHECK (quantity   >  0),
    CONSTRAINT CK_OrderItems_Subtotal CHECK (subtotal   >= 0)
);

CREATE TABLE Payments (
    payment_id       INT IDENTITY(1,1) PRIMARY KEY,
    order_id         INT            NOT NULL,
    payment_method   VARCHAR(20)    NOT NULL,
    payment_gateway  VARCHAR(50)    NULL,
    transaction_code VARCHAR(100)   NULL,
    amount           DECIMAL(18,2)  NOT NULL,
    payment_status   VARCHAR(20)    NOT NULL CONSTRAINT DF_Payments_Status   DEFAULT 'PENDING',
    paid_at          DATETIME2      NULL,
    created_at       DATETIME2      NOT NULL CONSTRAINT DF_Payments_CreatedAt DEFAULT SYSDATETIME(),
    updated_at       DATETIME2      NOT NULL CONSTRAINT DF_Payments_UpdatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Payments_Orders    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    CONSTRAINT UQ_Payments_Order     UNIQUE (order_id),
    CONSTRAINT CK_Payments_Method    CHECK (payment_method  IN ('COD','ONLINE')),
    CONSTRAINT CK_Payments_Amount    CHECK (amount          >= 0),
    CONSTRAINT CK_Payments_Status    CHECK (payment_status  IN ('PENDING','SUCCESS','FAILED','REFUNDED'))
);

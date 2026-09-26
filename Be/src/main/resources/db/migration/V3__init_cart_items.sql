CREATE TABLE CartItems (
    cart_item_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_CartItems_CreatedAt DEFAULT (SYSDATETIME()),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_CartItems_UpdatedAt DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_CartItems_Users FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    CONSTRAINT FK_CartItems_Products FOREIGN KEY (product_id) REFERENCES products(product_id),
    CONSTRAINT CK_CartItems_Quantity CHECK (quantity > 0),
    CONSTRAINT UQ_CartItems_User_Product UNIQUE (user_id, product_id)
);

CREATE INDEX IX_CartItems_User ON CartItems(user_id);
CREATE INDEX IX_CartItems_Product ON CartItems(product_id);

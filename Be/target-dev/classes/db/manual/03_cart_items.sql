-- SQL Server migration for the Cart module.
-- Run in Stationery_Store using SSMS/sqlcmd after Users and Products exist.
-- Safe to rerun: checks IF OBJECT_ID is null before create.

USE Stationery_Store;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID(N'dbo.CartItems', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.CartItems (
            cart_item_id BIGINT IDENTITY(1,1) NOT NULL,
            user_id BIGINT NOT NULL,
            product_id BIGINT NOT NULL,
            quantity INT NOT NULL,
            created_at DATETIME2 NOT NULL CONSTRAINT DF_CartItems_CreatedAt DEFAULT (SYSDATETIME()),
            updated_at DATETIME2 NOT NULL CONSTRAINT DF_CartItems_UpdatedAt DEFAULT (SYSDATETIME()),
            CONSTRAINT PK_CartItems PRIMARY KEY (cart_item_id)
        );

        ALTER TABLE dbo.CartItems WITH CHECK ADD CONSTRAINT FK_CartItems_Users FOREIGN KEY (user_id) REFERENCES dbo.Users(user_id) ON DELETE CASCADE;
        ALTER TABLE dbo.CartItems WITH CHECK ADD CONSTRAINT FK_CartItems_Products FOREIGN KEY (product_id) REFERENCES dbo.products(product_id);
        ALTER TABLE dbo.CartItems WITH CHECK ADD CONSTRAINT CK_CartItems_Quantity CHECK (quantity > 0);
        ALTER TABLE dbo.CartItems ADD CONSTRAINT UQ_CartItems_User_Product UNIQUE (user_id, product_id);

        CREATE INDEX IX_CartItems_User ON dbo.CartItems(user_id);
        CREATE INDEX IX_CartItems_Product ON dbo.CartItems(product_id);
    END;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

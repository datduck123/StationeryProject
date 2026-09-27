-- Spring Data JPA / SQL Server migration. Run after 01_order_tables.sql.
-- Manual and repeatable: this project does not include Flyway or Liquibase.
USE Stationery_Store;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID(N'dbo.Notifications', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.Notifications (
            id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Notifications PRIMARY KEY,
            user_id INT NOT NULL,
            order_id INT NOT NULL,
            type VARCHAR(30) NOT NULL,
            title NVARCHAR(200) NOT NULL,
            message NVARCHAR(1000) NOT NULL,
            is_read BIT NOT NULL CONSTRAINT DF_Notifications_IsRead DEFAULT (0),
            created_at DATETIME2 NOT NULL CONSTRAINT DF_Notifications_CreatedAt DEFAULT (SYSDATETIME())
        );
    END;

    IF EXISTS (
        SELECT 1 FROM (VALUES
            (N'id', N'int', NULL, 0), (N'user_id', N'int', NULL, 0),
            (N'order_id', N'int', NULL, 0), (N'type', N'varchar', 30, 0),
            (N'title', N'nvarchar', 400, 0), (N'message', N'nvarchar', 2000, 0),
            (N'is_read', N'bit', NULL, 0), (N'created_at', N'datetime2', NULL, 0)
        ) AS expected(column_name, type_name, max_length, nullable)
        LEFT JOIN sys.columns c ON c.object_id = OBJECT_ID(N'dbo.Notifications')
            AND c.name = expected.column_name
        LEFT JOIN sys.types t ON t.user_type_id = c.user_type_id
        WHERE c.column_id IS NULL OR t.name <> expected.type_name
            OR (expected.max_length IS NOT NULL AND c.max_length <> expected.max_length)
            OR c.is_nullable <> expected.nullable
    ) THROW 51002, 'Notifications table differs from the expected schema.', 1;

    IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID(N'dbo.Notifications') AND type = N'PK')
        ALTER TABLE dbo.Notifications ADD CONSTRAINT PK_Notifications PRIMARY KEY (id);

    IF NOT EXISTS (SELECT 1 FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID(N'dbo.Notifications')
            AND parent_column_id = COLUMNPROPERTY(OBJECT_ID(N'dbo.Notifications'), N'is_read', 'ColumnId'))
        ALTER TABLE dbo.Notifications ADD CONSTRAINT DF_Notifications_IsRead DEFAULT (0) FOR is_read;
    IF NOT EXISTS (SELECT 1 FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID(N'dbo.Notifications')
            AND parent_column_id = COLUMNPROPERTY(OBJECT_ID(N'dbo.Notifications'), N'created_at', 'ColumnId'))
        ALTER TABLE dbo.Notifications ADD CONSTRAINT DF_Notifications_CreatedAt DEFAULT (SYSDATETIME()) FOR created_at;

    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE parent_object_id = OBJECT_ID(N'dbo.Notifications') AND name = N'FK_Notifications_Users')
        ALTER TABLE dbo.Notifications WITH CHECK ADD CONSTRAINT FK_Notifications_Users
            FOREIGN KEY (user_id) REFERENCES dbo.Users(user_id);
    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE parent_object_id = OBJECT_ID(N'dbo.Notifications') AND name = N'FK_Notifications_Orders')
        ALTER TABLE dbo.Notifications WITH CHECK ADD CONSTRAINT FK_Notifications_Orders
            FOREIGN KEY (order_id) REFERENCES dbo.Orders(order_id);
    IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID(N'dbo.Notifications') AND name = N'CK_Notifications_Type')
        ALTER TABLE dbo.Notifications WITH CHECK ADD CONSTRAINT CK_Notifications_Type
            CHECK (type IN ('order_confirmed', 'status_updated', 'order_cancelled'));

    ALTER TABLE dbo.Notifications WITH CHECK CHECK CONSTRAINT
        FK_Notifications_Users, FK_Notifications_Orders, CK_Notifications_Type;

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Notifications') AND name = N'IX_Notifications_User_Created')
        CREATE INDEX IX_Notifications_User_Created ON dbo.Notifications(user_id, created_at DESC, id DESC);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Notifications') AND name = N'IX_Notifications_Order')
        CREATE INDEX IX_Notifications_Order ON dbo.Notifications(order_id);

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

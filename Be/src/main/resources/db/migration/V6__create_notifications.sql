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
        created_at DATETIME2 NOT NULL CONSTRAINT DF_Notifications_CreatedAt DEFAULT (SYSDATETIME()),
        CONSTRAINT FK_Notifications_Users FOREIGN KEY (user_id) REFERENCES dbo.Users(user_id),
        CONSTRAINT FK_Notifications_Orders FOREIGN KEY (order_id) REFERENCES dbo.Orders(order_id),
        CONSTRAINT CK_Notifications_Type CHECK (
            type IN ('order_confirmed', 'status_updated', 'order_cancelled')
        )
    );
END;

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.Notifications')
      AND name = N'IX_Notifications_User_Created'
)
BEGIN
    CREATE INDEX IX_Notifications_User_Created
        ON dbo.Notifications(user_id, created_at DESC, id DESC);
END;

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.Notifications')
      AND name = N'IX_Notifications_Order'
)
BEGIN
    CREATE INDEX IX_Notifications_Order ON dbo.Notifications(order_id);
END;

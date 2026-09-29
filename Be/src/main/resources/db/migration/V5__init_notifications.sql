-- Flyway migration for Notifications matching SQL Server schema
IF OBJECT_ID(N'dbo.Notifications', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Notifications (
        id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        user_id INT NOT NULL,
        order_id INT NOT NULL,
        type VARCHAR(30) NOT NULL,
        title NVARCHAR(200) NOT NULL,
        message NVARCHAR(1000) NOT NULL,
        is_read BIT NOT NULL DEFAULT 0,
        created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_Notifications_Users FOREIGN KEY (user_id) REFERENCES Users(user_id),
        CONSTRAINT FK_Notifications_Orders FOREIGN KEY (order_id) REFERENCES Orders(order_id)
    );
END;

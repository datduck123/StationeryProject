IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users (
        user_id BIGINT IDENTITY(1,1) PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        address VARCHAR(255),
        is_admin INT NOT NULL DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        created_at DATETIME2 NOT NULL,
        updated_at DATETIME2
    );
END;

/* Keep the purchased-item uniqueness when an administrator moderates a review. */
IF OBJECT_ID(N'dbo.Reviews', N'U') IS NULL
    THROW 51010, 'Reviews is missing. Apply the review migrations first.', 1;

IF COL_LENGTH(N'dbo.Reviews', N'is_hidden') IS NULL
BEGIN
    ALTER TABLE dbo.Reviews ADD is_hidden BIT NOT NULL
        CONSTRAINT DF_Reviews_IsHidden DEFAULT 0 WITH VALUES;
END;

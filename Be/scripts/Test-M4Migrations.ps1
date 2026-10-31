[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$backendRoot = Split-Path $PSScriptRoot -Parent
$configPath = Join-Path $backendRoot 'src/main/resources/application.properties'
$configText = Get-Content -LiteralPath $configPath -Raw
function Read-Setting([string]$name) {
    $match = [regex]::Match($configText, '(?m)^' + [regex]::Escape($name) + '=(.*)$')
    if (-not $match.Success) { throw "Missing configuration setting: $name" }
    return $match.Groups[1].Value.Trim()
}

$jdbcUrl = Read-Setting 'spring.datasource.url'
$hostMatch = [regex]::Match($jdbcUrl, '^jdbc:sqlserver://([^;]+)')
if (-not $hostMatch.Success) { throw 'Expected a SQL Server JDBC datasource URL.' }
$serverTarget = $hostMatch.Groups[1].Value.Replace(':', ',')
if ($serverTarget -notin @('localhost,1433', '127.0.0.1,1433', 'localhost', '127.0.0.1')) {
    throw 'This migration verification script only permits a local SQL Server.'
}

$databaseName = 'Stationery_M4_Verify_' + [guid]::NewGuid().ToString('N')
if ($databaseName -notmatch '^Stationery_M4_Verify_[0-9a-f]{32}$') { throw 'Unsafe scratch database name.' }
$builder = [System.Data.SqlClient.SqlConnectionStringBuilder]::new()
$builder['Data Source'] = $serverTarget
$builder['Initial Catalog'] = 'master'
$builder['User ID'] = Read-Setting 'spring.datasource.username'
$builder['Password'] = Read-Setting 'spring.datasource.password'
$builder['Connect Timeout'] = 10
$builder['Encrypt'] = $false
$builder['TrustServerCertificate'] = $true
$masterConnection = [System.Data.SqlClient.SqlConnection]::new($builder.ConnectionString)
$scratchConnection = $null
$created = $false

function Invoke-Sql([string]$sql, [System.Data.SqlClient.SqlConnection]$connection = $scratchConnection) {
    $command = $connection.CreateCommand()
    try {
        $command.CommandTimeout = 90
        $command.CommandText = $sql
        [void]$command.ExecuteNonQuery()
    } finally { $command.Dispose() }
}

function Invoke-Migration([System.IO.FileInfo]$file) {
    $sql = Get-Content -LiteralPath $file.FullName -Raw
    foreach ($batch in [regex]::Split($sql, '(?im)^\s*GO\s*(?:--[^\r\n]*)?\r?$')) {
        if (-not [string]::IsNullOrWhiteSpace($batch)) { Invoke-Sql $batch }
    }
    Write-Output "PASS migration: $($file.Name)"
}

function Assert-Rejected([string]$label, [string]$sql, [int[]]$expectedNumbers = @(547)) {
    $rejected = $false
    try { Invoke-Sql $sql }
    catch [System.Data.SqlClient.SqlException] {
        if ($_.Exception.Number -notin $expectedNumbers) { throw }
        $rejected = $true
    }
    if (-not $rejected) { throw "Constraint did not reject: $label" }
    Write-Output "PASS constraint: $label"
}

try {
    $masterConnection.Open()
    Invoke-Sql "CREATE DATABASE [$databaseName];" $masterConnection
    $created = $true
    $builder['Initial Catalog'] = $databaseName
    $scratchConnection = [System.Data.SqlClient.SqlConnection]::new($builder.ConnectionString)
    $scratchConnection.Open()
    $migrations = Get-ChildItem -LiteralPath (Join-Path $backendRoot 'src/main/resources/db/migration') -Filter 'V*.sql' |
        Sort-Object { [int]([regex]::Match($_.Name, '^V(\d+)').Groups[1].Value) }
    foreach ($migration in $migrations) { Invoke-Migration $migration }
    foreach ($migration in $migrations | Where-Object { $_.Name -match '^V(?:[6-9]|10)__' }) { Invoke-Migration $migration }

    Invoke-Sql @'
INSERT INTO dbo.Users(full_name,email,password_hash,status) VALUES(N'M4 verifier','m4-verify@example.invalid','test-only','ACTIVE');
INSERT INTO dbo.Categories(name) VALUES(N'M4 category');
INSERT INTO dbo.Brands(name) VALUES(N'M4 brand');
INSERT INTO dbo.Products(category_id,brand_id,name,sku,price,weight_kg,stock_quantity,status)
VALUES(1,1,N'M4 product','M4-VERIFY',25000,0.2,10,'ACTIVE');
INSERT INTO dbo.Vouchers(code,discount_amount,min_order_amount,start_date,end_date,usage_limit)
VALUES('M4VERIFY',5000,0,DATEADD(DAY,-1,SYSDATETIME()),DATEADD(DAY,1,SYSDATETIME()),5);
INSERT INTO dbo.Orders(user_id,voucher_id,subtotal,discount_amount,shipping_method,total_weight_kg,shipping_fee,total_cost,shipping_address,phone,order_status,tracking_code)
VALUES(1,1,25000,5000,'STANDARD',0.2,20000,40000,N'M4 test address','0901234567','DELIVERED','M4-TRACK-1');
INSERT INTO dbo.OrderItems(order_id,product_id,product_name,unit_price,quantity,subtotal)
VALUES(1,1,N'M4 product',25000,1,25000);
INSERT INTO dbo.Reviews(order_item_id,user_id,product_id,rating,comment)
VALUES(1,1,1,5,N'Valid migration verification review');
'@
    Assert-Rejected 'invalid order status' "UPDATE dbo.Orders SET order_status='INVALID' WHERE order_id=1;"
    Assert-Rejected 'negative order subtotal' 'UPDATE dbo.Orders SET subtotal=-1 WHERE order_id=1;'
    Assert-Rejected 'zero item quantity' 'UPDATE dbo.OrderItems SET quantity=0 WHERE order_item_id=1;'
    Assert-Rejected 'missing order FK' 'UPDATE dbo.OrderItems SET order_id=2147483647 WHERE order_item_id=1;'
    Assert-Rejected 'missing user FK' 'UPDATE dbo.Orders SET user_id=2147483647 WHERE order_id=1;'
    Assert-Rejected 'missing voucher FK' 'UPDATE dbo.Orders SET voucher_id=2147483647 WHERE order_id=1;'
    Assert-Rejected 'duplicate review item' "INSERT INTO dbo.Reviews(order_item_id,user_id,product_id,rating,comment) VALUES(1,1,1,4,N'Duplicate review');" @(2601,2627)
    Assert-Rejected 'invalid review rating' 'UPDATE dbo.Reviews SET rating=6 WHERE order_item_id=1;'
    Assert-Rejected 'blank review comment' "UPDATE dbo.Reviews SET comment=N' ' WHERE order_item_id=1;"
    Assert-Rejected 'missing review user FK' 'UPDATE dbo.Reviews SET user_id=2147483647 WHERE order_item_id=1;'
    Assert-Rejected 'missing review product FK' 'UPDATE dbo.Reviews SET product_id=2147483647 WHERE order_item_id=1;'
    Assert-Rejected 'duplicate tracking code' @'
INSERT INTO dbo.Orders(user_id,subtotal,discount_amount,shipping_method,total_weight_kg,shipping_fee,total_cost,shipping_address,phone,order_status,tracking_code)
VALUES(1,25000,0,'STANDARD',0.2,20000,45000,N'M4 test address','0901234567','PENDING','M4-TRACK-1');
'@ @(2601,2627)

    foreach ($migration in $migrations | Where-Object { $_.Name -match '^V(?:8|9|10)__' }) { Invoke-Migration $migration }
    Write-Output 'PASS: reconciliation migrations also run with populated tables.'

    # Simulate a baselined legacy order schema only inside this generated scratch database.
    Invoke-Sql @'
ALTER TABLE dbo.OrderItems DROP CONSTRAINT CK_OrderItems_Quantity;
ALTER TABLE dbo.Orders DROP CONSTRAINT FK_Orders_Vouchers;
ALTER TABLE dbo.Orders NOCHECK CONSTRAINT CK_Orders_Status;
DROP TABLE dbo.Reviews;
CREATE TABLE dbo.Reviews (
    review_id INT IDENTITY(1,1) PRIMARY KEY,
    order_item_id INT NULL,
    rating INT NULL,
    comment NVARCHAR(1000) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
INSERT INTO dbo.Reviews(order_item_id,rating,comment) VALUES(1,5,N'Legacy review awaiting relation backfill');
'@
    foreach ($migration in $migrations | Where-Object { $_.Name -match '^V(?:8|9|10)__' }) { Invoke-Migration $migration }
    Invoke-Sql @'
IF NOT EXISTS (SELECT 1 FROM dbo.Reviews WHERE order_item_id=1 AND user_id=1 AND product_id=1)
    THROW 51010, 'Legacy review relation backfill failed.', 1;
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('dbo.Reviews')
    AND name IN ('order_item_id','rating','comment','user_id','product_id') AND is_nullable=1)
    THROW 51010, 'Legacy review still has nullable required columns.', 1;
'@
    Assert-Rejected 'restored item quantity check' 'UPDATE dbo.OrderItems SET quantity=0 WHERE order_item_id=1;'
    Assert-Rejected 'restored voucher FK' 'UPDATE dbo.Orders SET voucher_id=2147483647 WHERE order_id=1;'
    Assert-Rejected 'legacy review uniqueness' "INSERT INTO dbo.Reviews(order_item_id,user_id,product_id,rating,comment) VALUES(1,1,1,5,N'Duplicate legacy review');" @(2601,2627)
    Write-Output 'PASS: legacy nullable reviews and missing order constraints reconciled.'

    if ($migrations.Name -match '^V10__') {
        Invoke-Sql @'
IF NOT EXISTS (SELECT 1 FROM dbo.Reviews WHERE order_item_id=1 AND is_hidden=0)
    THROW 51010, 'Existing reviews were not backfilled as visible.', 1;
UPDATE dbo.Reviews SET is_hidden=1 WHERE order_item_id=1;
'@
        Assert-Rejected 'hidden review still prevents reposting' "INSERT INTO dbo.Reviews(order_item_id,user_id,product_id,rating,comment) VALUES(1,1,1,5,N'Reposting a hidden review');" @(2601,2627)
        Assert-Rejected 'review moderation flag is required' 'UPDATE dbo.Reviews SET is_hidden=NULL WHERE order_item_id=1;' @(515)
    }

    Invoke-Sql @'
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE is_disabled=1 OR is_not_trusted=1)
    THROW 51010, 'A foreign key is disabled or untrusted.', 1;
IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE is_disabled=1 OR is_not_trusted=1)
    THROW 51010, 'A check constraint is disabled or untrusted.', 1;
'@
    Write-Output 'PASS: all SQL Server migrations and M4 database constraints.'
} finally {
    if ($null -ne $scratchConnection) { $scratchConnection.Dispose() }
    [System.Data.SqlClient.SqlConnection]::ClearAllPools()
    if ($created) {
        if ($databaseName -notmatch '^Stationery_M4_Verify_[0-9a-f]{32}$') { throw 'Refusing to drop unsafe database name.' }
        Invoke-Sql "ALTER DATABASE [$databaseName] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [$databaseName];" $masterConnection
        Write-Output 'Scratch database removed.'
    }
    $masterConnection.Dispose()
}

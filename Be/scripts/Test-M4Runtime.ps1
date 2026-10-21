[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$backendRoot = Split-Path $PSScriptRoot -Parent
$configText = Get-Content -LiteralPath (Join-Path $backendRoot 'src/main/resources/application.properties') -Raw
function Read-Setting([string]$name) {
    $match = [regex]::Match($configText, '(?m)^' + [regex]::Escape($name) + '=(.*)$')
    if (-not $match.Success) { throw "Missing setting: $name" }
    return $match.Groups[1].Value.Trim()
}

$serverMatch = [regex]::Match((Read-Setting 'spring.datasource.url'), '^jdbc:sqlserver://([^;]+)')
$databaseMatch = [regex]::Match((Read-Setting 'spring.datasource.url'), '(?:^|;)databaseName=([^;]+)')
if (-not $serverMatch.Success -or -not $databaseMatch.Success) { throw 'Expected SQL Server datasource.' }
$serverTarget = $serverMatch.Groups[1].Value.Replace(':', ',')
if ($serverTarget -notin @('localhost,1433', '127.0.0.1,1433', 'localhost', '127.0.0.1')) {
    throw 'Only a local SQL Server is permitted.'
}
$builder = [System.Data.SqlClient.SqlConnectionStringBuilder]::new()
$builder['Data Source'] = $serverTarget
$builder['Initial Catalog'] = $databaseMatch.Groups[1].Value
$builder['User ID'] = Read-Setting 'spring.datasource.username'
$builder['Password'] = Read-Setting 'spring.datasource.password'
$builder['Connect Timeout'] = 10
$builder['Encrypt'] = $false
$builder['TrustServerCertificate'] = $true
$connection = [System.Data.SqlClient.SqlConnection]::new($builder.ConnectionString)
$handler = [System.Net.Http.HttpClientHandler]::new()
$handler.AllowAutoRedirect = $false
$client = [System.Net.Http.HttpClient]::new($handler)
$client.Timeout = [TimeSpan]::FromSeconds(30)
$secretPath = Join-Path $backendRoot '.dev-jwt-secret'
$secret = (Get-Content -LiteralPath $secretPath -Raw).Trim()
if ([Text.Encoding]::UTF8.GetByteCount($secret) -lt 32) { throw 'Local development JWT secret is missing or too short.' }
$script:requestCount = 0

function Read-Row([string]$sql) {
    $command = $connection.CreateCommand()
    try {
        $command.CommandText = $sql
        $reader = $command.ExecuteReader()
        try {
            if (-not $reader.Read()) { return $null }
            $row = @{}
            for ($i = 0; $i -lt $reader.FieldCount; $i++) { $row[$reader.GetName($i)] = $reader.GetValue($i) }
            return $row
        } finally { $reader.Dispose() }
    } finally { $command.Dispose() }
}

function Convert-Base64Url([byte[]]$bytes) {
    return [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
}

function New-LocalToken([hashtable]$user, [string]$role) {
    $issued = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    $header = Convert-Base64Url ([Text.Encoding]::UTF8.GetBytes('{"alg":"HS256","typ":"JWT"}'))
    $payload = @{sub=$user.email; userId=$user.user_id; role=$role; iat=$issued; exp=($issued+300)} | ConvertTo-Json -Compress
    $payloadEncoded = Convert-Base64Url ([Text.Encoding]::UTF8.GetBytes($payload))
    $unsigned = "$header.$payloadEncoded"
    $hmac = [Security.Cryptography.HMACSHA256]::new([Text.Encoding]::UTF8.GetBytes($secret))
    try { return $unsigned + '.' + (Convert-Base64Url ($hmac.ComputeHash([Text.Encoding]::UTF8.GetBytes($unsigned)))) }
    finally { $hmac.Dispose() }
}

function Invoke-LocalApi([string]$path, [string]$token, [int]$expectedStatus=200, [string]$method='GET', [string]$body=$null) {
    if (-not $path.StartsWith('/api/') -or $path.Contains('://')) { throw 'Only local API paths are allowed.' }
    if ($method -ne 'GET' -and -not ($method -eq 'POST' -and $path -eq '/api/reviews' -and $body -match '"rating"\s*:\s*0')) {
        throw 'Runtime verification permits GET and the deliberately invalid rating=0 review request only.'
    }
    $request = [System.Net.Http.HttpRequestMessage]::new([System.Net.Http.HttpMethod]::new($method), "http://localhost:8080$path")
    try {
        if ($token) { $request.Headers.Authorization = [System.Net.Http.Headers.AuthenticationHeaderValue]::new('Bearer', $token) }
        if ($null -ne $body) { $request.Content = [System.Net.Http.StringContent]::new($body, [Text.Encoding]::UTF8, 'application/json') }
        $response = $client.SendAsync($request).GetAwaiter().GetResult()
        try {
            $status = [int]$response.StatusCode
            $content = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
            $script:requestCount++
            if ($status -ne $expectedStatus) { throw "Unexpected HTTP $status for $method $path (expected $expectedStatus)." }
            $json = if ($content) { $content | ConvertFrom-Json } else { $null }
            $countSuffix = ''
            if ($json -is [System.Array]) { $countSuffix = "; count=$($json.Count)" }
            elseif ($null -ne $json -and $null -ne $json.totalElements) { $countSuffix = "; count=$($json.totalElements)" }
            elseif ($null -ne $json -and $null -ne $json.reviewCount) { $countSuffix = "; count=$($json.reviewCount)" }
            Write-Host "PASS HTTP $status $method $path$countSuffix"
            return $json
        } finally { $response.Dispose() }
    } finally { $request.Dispose() }
}

try {
    $connection.Open()
    $customer = Read-Row "SELECT TOP(1) u.user_id,u.email FROM dbo.Users u LEFT JOIN dbo.Orders o ON o.user_id=u.user_id WHERE u.status='ACTIVE' AND u.is_admin=0 GROUP BY u.user_id,u.email ORDER BY COUNT(o.order_id) DESC,u.user_id;"
    $admin = Read-Row "SELECT TOP(1) user_id,email FROM dbo.Users WHERE status='ACTIVE' AND is_admin=1 ORDER BY user_id;"
    $product = Read-Row "SELECT TOP(1) product_id FROM dbo.Products WHERE status='ACTIVE' ORDER BY product_id;"
    $reviewCountBefore = Read-Row 'SELECT COUNT(*) AS total FROM dbo.Reviews;'
    if ($null -eq $customer -or $null -eq $admin -or $null -eq $product) { throw 'Runtime check requires an active customer, admin and product.' }
    $customerToken = New-LocalToken $customer 'ROLE_CUSTOMER'
    $adminToken = New-LocalToken $admin 'ROLE_ADMIN'
    $productId = $product.product_id
    $null = Invoke-LocalApi '/api/products?page=0&size=2' ''
    $null = Invoke-LocalApi "/api/products/$productId" ''
    $null = Invoke-LocalApi "/api/products/$productId/reviews?page=0&size=2" ''
    $null = Invoke-LocalApi "/api/products/$productId/reviews/eligibility" ''
    $null = Invoke-LocalApi "/api/products/$productId/reviews/eligibility" $customerToken
    $null = Invoke-LocalApi '/api/cart?shippingMethod=STANDARD' $customerToken
    $null = Invoke-LocalApi '/api/cart?shippingMethod=EXPRESS' $customerToken
    $null = Invoke-LocalApi '/api/vouchers/active' $customerToken
    $orders = Invoke-LocalApi '/api/orders?page=0&size=2&sortBy=createdAt&sortDir=desc' $customerToken
    $null = Invoke-LocalApi '/api/orders?page=0&size=2&sortBy=totalCost&sortDir=asc&status=PENDING' $customerToken
    if ($orders.content.Count -gt 0) {
        $orderId = $orders.content[0].orderId
        $null = Invoke-LocalApi "/api/orders/$orderId" $customerToken
        $null = Invoke-LocalApi "/api/admin/orders/$orderId" $adminToken
    }
    $null = Invoke-LocalApi '/api/notifications?page=0&size=2' $customerToken
    $null = Invoke-LocalApi '/api/notifications?page=0&size=2&is_read=false' $customerToken
    $null = Invoke-LocalApi '/api/admin/orders?page=0&size=2' $adminToken
    $null = Invoke-LocalApi '/api/admin/orders?page=0&size=2&status=PENDING&sortBy=totalCost&sortDir=asc' $adminToken
    $null = Invoke-LocalApi '/api/admin/orders/stats' $adminToken
    $null = Invoke-LocalApi '/api/admin/orders?page=0&size=2' $customerToken 403
    $null = Invoke-LocalApi '/api/reviews' $customerToken 400 'POST' '{"orderItemId":2147483647,"rating":0,"comment":"Validation must reject without writing"}'
    $reviewCountAfter = Read-Row 'SELECT COUNT(*) AS total FROM dbo.Reviews;'
    if ($reviewCountBefore.total -ne $reviewCountAfter.total) { throw 'Review count changed during the read-only smoke check.' }
    Write-Output "PASS: $script:requestCount local HTTP runtime checks; review count unchanged."
} finally {
    $connection.Dispose()
    $client.Dispose()
    $handler.Dispose()
    $secret = $null
    $customerToken = $null
    $adminToken = $null
}

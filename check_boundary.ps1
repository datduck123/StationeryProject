[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::OpenRead("SBA301_Project_Report_Group8.docx")
$entry = $zip.GetEntry("word/document.xml")
$reader = New-Object System.IO.StreamReader($entry.Open(), [System.Text.Encoding]::UTF8)
$xml = $reader.ReadToEnd()
$reader.Dispose()
$zip.Dispose()

$firstIdx = $xml.IndexOf("5. Development Process")
$sec5Head = $xml.IndexOf("5. Development Process", $firstIdx + 10)
$pStart5 = $xml.LastIndexOf("<w:p", $sec5Head)

$idxApp = $xml.IndexOf("PH&#x1EE5; L&#x1EE5;C")
if ($idxApp -eq -1) { $idxApp = $xml.IndexOf("Ph&#x1EE5; l&#x1EE5;c") }
if ($idxApp -eq -1) { $idxApp = $xml.LastIndexOf("APPENDIX") }
$pStartApp = $xml.LastIndexOf("<w:p", $idxApp)

Write-Host "sec5Head: $sec5Head, pStart5: $pStart5, idxApp: $idxApp, pStartApp: $pStartApp, totalLength: $($xml.Length)"


[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::OpenRead("SBA301_Project_Report_Group8.docx")
$entry = $zip.GetEntry("word/document.xml")
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
$text = $reader.ReadToEnd()
$reader.Dispose()
$zip.Dispose()

$idx5 = $text.IndexOf("5. Development Process", 20000)
$idx6 = $text.IndexOf("6. Testing &amp; Results", $idx5)
$idx7 = $text.IndexOf("7. Conclusion &amp; Future Improvements", $idx6)
$idxApp = $text.LastIndexOf("PH&#x1EE5; L&#x1EE5;C")
if ($idxApp -eq -1) { $idxApp = $text.LastIndexOf("APPENDIX") }

Write-Host "idx5: $idx5, idx6: $idx6, idx7: $idx7, idxApp: $idxApp, totalLength: $($text.Length)"


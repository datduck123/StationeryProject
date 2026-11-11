[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName System.IO.Compression.FileSystem

$docxPath = "SBA301_Project_Report_Group8.docx"

# Read new English XML
$newSectionsXml = [System.IO.File]::ReadAllText("new_sections_en.xml", [System.Text.Encoding]::UTF8)
Write-Host "Loaded new_sections_en.xml with length: $($newSectionsXml.Length)"

# Read current document.xml
$zip = [System.IO.Compression.ZipFile]::OpenRead($docxPath)
$entry = $zip.GetEntry("word/document.xml")
$reader = New-Object System.IO.StreamReader($entry.Open(), [System.Text.Encoding]::UTF8)
$xml = $reader.ReadToEnd()
$reader.Dispose()
$zip.Dispose()

# Locate boundaries
$firstIdx = $xml.IndexOf("5. Development Process")
$sec5Head = $xml.IndexOf("5. Development Process", $firstIdx + 10)
$pStart5 = $xml.LastIndexOf("<w:p", $sec5Head)

$idxApp = $xml.IndexOf("PH&#x1EE5; L&#x1EE5;C")
if ($idxApp -eq -1) { $idxApp = $xml.IndexOf("Ph&#x1EE5; l&#x1EE5;c") }
if ($idxApp -eq -1) { $idxApp = $xml.LastIndexOf("APPENDIX") }
$pStartApp = $xml.LastIndexOf("<w:p", $idxApp)

Write-Host "pStart5: $pStart5, pStartApp: $pStartApp, current length: $($xml.Length)"
if ($pStart5 -lt 0 -or $pStartApp -le $pStart5) {
    Write-Error "Invalid boundaries! Aborting update."
    exit 1
}

# Splice updated XML
$prefix = $xml.Substring(0, $pStart5)
$suffix = $xml.Substring($pStartApp)
$updatedXml = $prefix + $newSectionsXml + $suffix

Write-Host "Original XML: $($xml.Length), New XML: $($updatedXml.Length)"

# Update Zip
$zipUpdate = [System.IO.Compression.ZipFile]::Open($docxPath, [System.IO.Compression.ZipArchiveMode]::Update)
$oldEntry = $zipUpdate.GetEntry("word/document.xml")
$oldEntry.Delete()

$newEntry = $zipUpdate.CreateEntry("word/document.xml")
$writer = New-Object System.IO.StreamWriter($newEntry.Open(), [System.Text.Encoding]::UTF8)
$writer.Write($updatedXml)
$writer.Flush()
$writer.Close()
$zipUpdate.Dispose()

Write-Host "Successfully updated $docxPath with English content!"


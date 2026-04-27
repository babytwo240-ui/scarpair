$path = "src\pages\AdminDashboard.jsx"
$content = Get-Content $path -Raw -Encoding UTF8

# The new component's return closes at the first ");}" sequence after the new code.
# We find the FIRST occurrence of "  );\r\n}" or "  );\n}" and cut everything between
# that point and the second occurrence (the old duplicate).

# Strategy: split on the marker "  );" and keep only up to the FIRST one, then append the LineProgress + export.

$marker = "  );"
$idx = $content.IndexOf($marker)
if ($idx -lt 0) {
    Write-Host "Marker not found in file."
    exit 1
}

# Everything up to and including the first ");" plus a newline + "}"
$before = $content.Substring(0, $idx + $marker.Length)

# Now locate LineProgress function which should follow  
$lpMarker = "function LineProgress"
$lpIdx = $content.IndexOf($lpMarker)
if ($lpIdx -lt 0) {
    Write-Host "LineProgress not found."
    exit 1
}

$after = $content.Substring($lpIdx)

$result = $before + "`r`n}" + "`r`n`r`n" + $after

[System.IO.File]::WriteAllText((Resolve-Path $path).Path, $result, [System.Text.Encoding]::UTF8)
Write-Host "Done. File cleaned successfully."

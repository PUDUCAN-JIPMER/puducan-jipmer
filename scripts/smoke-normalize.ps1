param(
    [string]$Text = "Patient Lakshmi 45 years vandhi 3 times nethu thalai vali heavy fever 101 sugar chemo last week doctor ah paakanum",
    [string]$Language = "tanglish",
    [string]$Source = "typed",
    [string]$Url = "http://localhost:3000/api/notes/normalize"
)

Write-Host "→ Sending:" -ForegroundColor Cyan
Write-Host "  text     = $Text"
Write-Host "  language = $Language"
Write-Host "  source   = $Source"
Write-Host ""

$body = @{
    text     = $Text
    language = $Language
    source   = $Source
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $Url -Method Post -ContentType "application/json" -Body $body
    Write-Host "← Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "✗ Error $($_.Exception.Response.StatusCode.value__):" -ForegroundColor Red
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Host $reader.ReadToEnd() -ForegroundColor Yellow
}
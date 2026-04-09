Write-Host "Starting Maven..."
$job = Start-Job -Name BootJob -ScriptBlock { 
    Set-Location -Path "C:\Users\Mayank Jain\Desktop\Backend\MediChain\backend"
    .\mvnw.cmd spring-boot:run 
}

$retries = 0
$up = $false
while ($retries -lt 30) {
    Start-Sleep -Seconds 3
    try {
        $testResp = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/generate-expired-token" -ErrorAction Stop
        $up = $true
        break
    } catch {
        $retries++
        Write-Host "Waiting..."
    }
}

if (-not $up) {
    Write-Host "Server failed to start in time! Fetching Logs:"
    Receive-Job -Name BootJob
} else {
    try {
        Write-Host "`n1. Checking Auth Generate Expired Token..."
        $tokenResp = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/generate-expired-token"
        $token = $tokenResp.token
        Write-Host "Token generated."
        
        Write-Host "`n2. Checking Patient Vault with Expired Token..."
        try {
            $vaultResp = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/dashboard/patient/vault" -Headers @{ Authorization="Bearer $token" }
            Write-Host "Unexpected Vault Success! Output: $vaultResp"
        } catch [System.Net.WebException] {
            if ($_.Exception.Response) {
                $stream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($stream)
                $responseBody = $reader.ReadToEnd()
                Write-Host "Expected Vault Error Received!"
                Write-Host "Response Body: $responseBody"
                Write-Host "Status Code: " $([int]$_.Exception.Response.StatusCode)
            } else {
                Write-Host $_.Exception.Message
            }
        }

        Write-Host "`n3. Checking GeminiAnalysis Fallback..."
        $fallbackResp = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/test-fallback"
        Write-Host "Fallback JSON: " ($fallbackResp | ConvertTo-Json -Depth 5)

    } finally {
        Write-Host "`nStopping Spring Boot..."
        Stop-Process -Name java -Force -ErrorAction SilentlyContinue
    }
}
Remove-Job -Name BootJob -Force

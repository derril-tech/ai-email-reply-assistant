# API Endpoint Test Script
# Tests all core API endpoints for the AI Email Reply Assistant

param(
    [string]$ApiUrl = "http://localhost:8000"
)

Write-Host "`n=== AI Email Reply Assistant - API Test Suite ===" -ForegroundColor Cyan
Write-Host "API URL: $ApiUrl`n" -ForegroundColor Yellow

$testsPassed = 0
$testsFailed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Path,
        [hashtable]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "Testing: $Name..." -NoNewline
    
    try {
        $uri = "$ApiUrl$Path"
        $params = @{
            Uri = $uri
            Method = $Method
            UseBasicParsing = $true
            ErrorAction = 'Stop'
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
            $params.ContentType = 'application/json'
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host " ✅ PASS" -ForegroundColor Green
            $script:testsPassed++
            return $response
        } else {
            Write-Host " ❌ FAIL (Expected $ExpectedStatus, got $($response.StatusCode))" -ForegroundColor Red
            $script:testsFailed++
            return $null
        }
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq $ExpectedStatus) {
            Write-Host " ✅ PASS (Expected error)" -ForegroundColor Green
            $script:testsPassed++
            return $null
        } else {
            Write-Host " ❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
            $script:testsFailed++
            return $null
        }
    }
}

# Test 1: Health Check
Write-Host "`n--- Journey 6: API Health Check ---" -ForegroundColor Magenta
$healthResponse = Test-Endpoint `
    -Name "GET /jobs/health" `
    -Method "GET" `
    -Path "/jobs/health"

if ($healthResponse) {
    $healthData = $healthResponse.Content | ConvertFrom-Json
    Write-Host "  Status: $($healthData.status)" -ForegroundColor Gray
}

# Test 2: Run Agent (Valid Request)
Write-Host "`n--- Journey 7: API Run Agent & Poll Job ---" -ForegroundColor Magenta
$runResponse = Test-Endpoint `
    -Name "POST /agent/run (valid)" `
    -Method "POST" `
    -Path "/agent/run" `
    -Body @{
        projectId = "test-project"
        input = "Please reply professionally"
        meta = @{
            threadId = "thread_123"
            tone = "professional"
            length = 150
            bullets = $false
        }
    }

if ($runResponse) {
    $runData = $runResponse.Content | ConvertFrom-Json
    $jobId = $runData.jobId
    Write-Host "  Job ID: $jobId" -ForegroundColor Gray
    
    # Test 3: Poll Job
    Start-Sleep -Milliseconds 500
    $jobResponse = Test-Endpoint `
        -Name "GET /jobs/$jobId" `
        -Method "GET" `
        -Path "/jobs/$jobId"
    
    if ($jobResponse) {
        $jobData = $jobResponse.Content | ConvertFrom-Json
        Write-Host "  Job Status: $($jobData.status)" -ForegroundColor Gray
        Write-Host "  Draft Preview: $($jobData.result.text.Substring(0, [Math]::Min(50, $jobData.result.text.Length)))..." -ForegroundColor Gray
    }
}

# Test 4: Fetch Messages
Write-Host "`n--- Journey 8: API Fetch Messages ---" -ForegroundColor Magenta
$messagesResponse = Test-Endpoint `
    -Name "GET /messages?projectId=test-project" `
    -Method "GET" `
    -Path "/messages?projectId=test-project"

if ($messagesResponse) {
    $messagesData = $messagesResponse.Content | ConvertFrom-Json
    Write-Host "  Message Count: $($messagesData.items.Count)" -ForegroundColor Gray
}

# Test 5: Error Handling - Missing threadId
Write-Host "`n--- Journey 9: Error Handling ---" -ForegroundColor Magenta
Test-Endpoint `
    -Name "POST /agent/run (missing threadId)" `
    -Method "POST" `
    -Path "/agent/run" `
    -Body @{
        projectId = "test"
        input = "test"
        meta = @{}
    } `
    -ExpectedStatus 400

# Test 6: Error Handling - Invalid Job ID
Test-Endpoint `
    -Name "GET /jobs/invalid-id (404)" `
    -Method "GET" `
    -Path "/jobs/invalid-id-12345" `
    -ExpectedStatus 404

# Summary
Write-Host "`n=== Test Summary ===" -ForegroundColor Cyan
Write-Host "Passed: $testsPassed" -ForegroundColor Green
Write-Host "Failed: $testsFailed" -ForegroundColor Red

if ($testsFailed -eq 0) {
    Write-Host "`n✅ All API tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n❌ Some tests failed. Please review." -ForegroundColor Red
    exit 1
}


$ErrorActionPreference = 'Stop'

$base = 'http://localhost:5000'
$results = New-Object System.Collections.Generic.List[object]

function Add-Result($name, $status, $ok, $detail) {
    $results.Add([pscustomobject]@{
        Api = $name
        Status = $status
        Pass = $ok
        Detail = $detail
    })
}

function Invoke-Json($method, $url, $body, $headers) {
    $params = @{ Method = $method; Uri = $url; Headers = $headers; ContentType = 'application/json' }
    if ($null -ne $body) { $params.Body = ($body | ConvertTo-Json -Depth 10) }

    try {
        $resp = Invoke-WebRequest @params -UseBasicParsing
        $content = if ($resp.Content) { $resp.Content | ConvertFrom-Json } else { $null }
        return @{ ok = $true; status = [int]$resp.StatusCode; body = $content }
    }
    catch {
        $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { -1 }
        $raw = ''
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $raw = $reader.ReadToEnd()
        }
        $bodyObj = $null
        try { $bodyObj = $raw | ConvertFrom-Json } catch { $bodyObj = $raw }
        return @{ ok = $false; status = $status; body = $bodyObj }
    }
}

# API health via API route (do not depend on Swagger in production)
try {
    $null = Invoke-WebRequest -Uri "$base/api/users/login" -Method Options -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
}
catch {
    if (-not $_.Exception.Response) {
        throw "API is not reachable at $base"
    }
}

# Admin login
$adminLogin = Invoke-Json 'POST' "$base/api/users/login" @{ email = 'admin@exe101.local'; password = 'Admin@123' } @{}
if (-not $adminLogin.ok) { throw "Admin login failed: $($adminLogin.status)" }
$adminToken = $adminLogin.body.accessToken
$adminUserId = $adminLogin.body.userId
$headers = @{ Authorization = "Bearer $adminToken" }
Add-Result 'admin.login' $adminLogin.status $adminLogin.ok "adminId=$adminUserId"

# Create test user for progress/enrollment ownership
$roles = Invoke-Json 'GET' "$base/api/roles?page=1&pageSize=100" $null $headers
$userRole = $roles.body.items | Where-Object { $_.code -eq 'user' } | Select-Object -First 1
if (-not $userRole) { throw 'User role missing.' }

$testEmail = "qa1518.$([Guid]::NewGuid().ToString('N').Substring(0,6))@mail.test"
$userCreate = Invoke-Json 'POST' "$base/api/users" @{
    roleId = $userRole.id
    email = $testEmail
    password = 'User@123456'
    fullName = 'QA 15-18 User'
    avatarMediaId = $null
    status = 0
} $headers
if (-not $userCreate.ok) { throw "Cannot create test user: $($userCreate.status)" }
$testUserId = $userCreate.body.id
Add-Result 'setup.user.create' $userCreate.status $true "userId=$testUserId"

# Create reference media
$mediaCreate = Invoke-Json 'POST' "$base/api/media_assets" @{
    ownerUserId = $adminUserId
    storageProvider = 's3'
    fileName = 'qa1518-ref.jpg'
    fileUrl = 'https://cdn.example.com/qa1518-ref.jpg'
    mimeType = 'image/jpeg'
    mediaType = 'image'
    fileSizeBytes = 12345
    durationSeconds = $null
    width = 640
    height = 480
    status = 2
} $headers
if (-not $mediaCreate.ok) { throw "Cannot create media ref: $($mediaCreate.status)" }
$mediaId = $mediaCreate.body.id
Add-Result 'setup.media.create' $mediaCreate.status $true "mediaId=$mediaId"

# Create course category + vocabulary category
$courseCatSlug = 'qa1518-coursecat-' + [Guid]::NewGuid().ToString('N').Substring(0, 8)
$courseCat = Invoke-Json 'POST' "$base/api/course_categories" @{
    name = 'QA1518 Course Category'
    slug = $courseCatSlug
    description = 'for test 15-18'
    colorHex = '#0099AA'
    iconMediaId = $mediaId
} $headers
if (-not $courseCat.ok) { throw "Cannot create course category: $($courseCat.status)" }
$courseCategoryId = $courseCat.body.id
Add-Result 'setup.course_category.create' $courseCat.status $true "id=$courseCategoryId"

$vocabCatSlug = 'qa1518-vocabcat-' + [Guid]::NewGuid().ToString('N').Substring(0, 8)
$vocabCat = Invoke-Json 'POST' "$base/api/vocabulary_categories" @{
    name = 'QA1518 Vocabulary Category'
    slug = $vocabCatSlug
    description = 'for test 15-18'
    displayOrder = 1
} $headers
if (-not $vocabCat.ok) { throw "Cannot create vocabulary category: $($vocabCat.status)" }
$vocabularyCategoryId = $vocabCat.body.id
Add-Result 'setup.vocabulary_category.create' $vocabCat.status $true "id=$vocabularyCategoryId"

# Create course -> module -> lesson
$courseSlug = 'qa1518-course-' + [Guid]::NewGuid().ToString('N').Substring(0, 8)
$courseCreate = Invoke-Json 'POST' "$base/api/courses" @{
    categoryId = $courseCategoryId
    title = 'QA1518 Course'
    slug = $courseSlug
    summary = 'summary'
    description = 'description'
    level = 'beginner'
    coverMediaId = $mediaId
    trailerMediaId = $mediaId
    isPremium = $false
    createdBy = $adminUserId
} $headers
if (-not $courseCreate.ok) { throw "Cannot create course: $($courseCreate.status)" }
$courseId = $courseCreate.body.id
Add-Result 'setup.course.create' $courseCreate.status $true "id=$courseId"

$moduleCreate = Invoke-Json 'POST' "$base/api/course_modules" @{
    courseId = $courseId
    title = 'QA1518 Module'
    description = 'module'
    sortOrder = 1
    isPreview = $true
} $headers
if (-not $moduleCreate.ok) { throw "Cannot create module: $($moduleCreate.status)" }
$moduleId = $moduleCreate.body.id
Add-Result 'setup.course_module.create' $moduleCreate.status $true "id=$moduleId"

$lessonSlug = 'qa1518-lesson-' + [Guid]::NewGuid().ToString('N').Substring(0, 8)
$lessonCreate = Invoke-Json 'POST' "$base/api/lessons" @{
    courseId = $courseId
    moduleId = $moduleId
    title = 'QA1518 Lesson'
    slug = $lessonSlug
    shortDescription = 'short'
    objectiveText = 'obj'
    coverMediaId = $mediaId
    videoMediaId = $mediaId
    lessonType = 'video'
    difficultyLevel = 'easy'
    estimatedMinutes = 15
    xpReward = 20
    sortOrder = 1
} $headers
if (-not $lessonCreate.ok) { throw "Cannot create lesson: $($lessonCreate.status)" }
$lessonId = $lessonCreate.body.id
Add-Result 'setup.lesson.create' $lessonCreate.status $true "id=$lessonId"

# Create vocabulary
$vocabCode = 'QA1518_' + [Guid]::NewGuid().ToString('N').Substring(0, 6)
$vocabularyCreate = Invoke-Json 'POST' "$base/api/vocabularies" @{
    categoryId = $vocabularyCategoryId
    code = $vocabCode
    termVi = 'qa tu vung'
    description = 'desc'
    usageExample = 'example'
    difficultyLevel = 'easy'
    handHintText = 'hint'
    isFeatured = $true
    createdBy = $adminUserId
} $headers
if (-not $vocabularyCreate.ok) { throw "Cannot create vocabulary: $($vocabularyCreate.status)" }
$vocabularyId = $vocabularyCreate.body.id
Add-Result 'setup.vocabulary.create' $vocabularyCreate.status $true "id=$vocabularyId"

# 15) enrollments
$enroll = Invoke-Json 'POST' "$base/api/enrollments/enroll" @{ userId = $testUserId; courseId = $courseId } $headers
$enrollmentId = $enroll.body.id
Add-Result 'enrollments.enroll' $enroll.status $enroll.ok "id=$enrollmentId"

$enrollGet = Invoke-Json 'GET' "$base/api/enrollments/$enrollmentId" $null $headers
Add-Result 'enrollments.getById' $enrollGet.status $enrollGet.ok 'fetched'

$enrollList = Invoke-Json 'GET' "$base/api/enrollments?page=1&pageSize=20" $null $headers
Add-Result 'enrollments.list' $enrollList.status $enrollList.ok "total=$($enrollList.body.total)"

$enrollByUser = Invoke-Json 'GET' "$base/api/enrollments/user/$testUserId" $null $headers
$byUserCount = if ($enrollByUser.ok -and $enrollByUser.body) { ($enrollByUser.body | Measure-Object).Count } else { 0 }
Add-Result 'enrollments.getByUser' $enrollByUser.status $enrollByUser.ok "count=$byUserCount"

$enrollProgress = Invoke-Json 'PATCH' "$base/api/enrollments/$enrollmentId/current-progress" @{
    currentModuleId = $moduleId
    currentLessonId = $lessonId
    progressPercent = 35.5
} $headers
Add-Result 'enrollments.updateProgress' $enrollProgress.status $enrollProgress.ok 'updated progress'

$enrollComplete = Invoke-Json 'POST' "$base/api/enrollments/$enrollmentId/complete" @{ progressPercent = 100 } $headers
Add-Result 'enrollments.complete' $enrollComplete.status $enrollComplete.ok 'completed'

# 16) user_lesson_progress
$ulpCreate = Invoke-Json 'POST' "$base/api/user_lesson_progress" @{
    userId = $testUserId
    lessonId = $lessonId
    status = 1
    startedAt = (Get-Date).ToUniversalTime().AddMinutes(-10).ToString('o')
    completedAt = $null
    lastPositionSeconds = 120
    attemptsCount = 2
    bestAccuracy = 87.5
    bestScore = 92.2
    totalTimeSeconds = 600
    xpEarned = 25
} $headers
$ulpId = $ulpCreate.body.id
Add-Result 'user_lesson_progress.create' $ulpCreate.status $ulpCreate.ok "id=$ulpId"

$ulpGet = Invoke-Json 'GET' "$base/api/user_lesson_progress/$ulpId" $null $headers
Add-Result 'user_lesson_progress.getById' $ulpGet.status $ulpGet.ok 'fetched'

$ulpList = Invoke-Json 'GET' "$base/api/user_lesson_progress?page=1&pageSize=20" $null $headers
Add-Result 'user_lesson_progress.list' $ulpList.status $ulpList.ok "total=$($ulpList.body.total)"

$ulpUpdate = Invoke-Json 'PUT' "$base/api/user_lesson_progress/$ulpId" @{
    status = 2
    startedAt = (Get-Date).ToUniversalTime().AddMinutes(-20).ToString('o')
    completedAt = (Get-Date).ToUniversalTime().ToString('o')
    lastPositionSeconds = 300
    attemptsCount = 3
    bestAccuracy = 90.1
    bestScore = 95.6
    totalTimeSeconds = 900
    xpEarned = 40
} $headers
Add-Result 'user_lesson_progress.update' $ulpUpdate.status $ulpUpdate.ok 'updated'

# 17) lesson_attempts
$laCreate = Invoke-Json 'POST' "$base/api/lesson_attempts" @{
    userId = $testUserId
    lessonId = $lessonId
    practiceSessionId = $null
    startedAt = (Get-Date).ToUniversalTime().AddMinutes(-5).ToString('o')
    finishedAt = (Get-Date).ToUniversalTime().ToString('o')
    accuracy = 85.2
    durationSeconds = 600
    xpEarned = 15
    passed = $true
    completionSource = 'practice'
} $headers
$lessonAttemptId = $laCreate.body.id
Add-Result 'lesson_attempts.create' $laCreate.status $laCreate.ok "id=$lessonAttemptId"

$laGet = Invoke-Json 'GET' "$base/api/lesson_attempts/$lessonAttemptId" $null $headers
Add-Result 'lesson_attempts.getById' $laGet.status $laGet.ok 'fetched'

$laList = Invoke-Json 'GET' "$base/api/lesson_attempts?page=1&pageSize=20" $null $headers
Add-Result 'lesson_attempts.list' $laList.status $laList.ok "total=$($laList.body.total)"

$laUpdate = Invoke-Json 'PUT' "$base/api/lesson_attempts/$lessonAttemptId" @{
    practiceSessionId = $null
    startedAt = (Get-Date).ToUniversalTime().AddMinutes(-6).ToString('o')
    finishedAt = (Get-Date).ToUniversalTime().ToString('o')
    accuracy = 89.4
    durationSeconds = 650
    xpEarned = 20
    passed = $true
    completionSource = 'practice-updated'
} $headers
Add-Result 'lesson_attempts.update' $laUpdate.status $laUpdate.ok 'updated'

# 18) user_vocabulary_progress
$uvpCreate = Invoke-Json 'POST' "$base/api/user_vocabulary_progress" @{
    userId = $testUserId
    vocabularyId = $vocabularyId
    status = 1
    firstLearnedAt = (Get-Date).ToUniversalTime().AddDays(-1).ToString('o')
    lastPracticedAt = (Get-Date).ToUniversalTime().ToString('o')
    masteryLevel = 55.5
    totalPracticeCount = 8
    correctCount = 6
    bestConfidence = 88.8
    isSaved = $true
} $headers
$uvpId = $uvpCreate.body.id
Add-Result 'user_vocabulary_progress.create' $uvpCreate.status $uvpCreate.ok "id=$uvpId"

$uvpGet = Invoke-Json 'GET' "$base/api/user_vocabulary_progress/$uvpId" $null $headers
Add-Result 'user_vocabulary_progress.getById' $uvpGet.status $uvpGet.ok 'fetched'

$uvpList = Invoke-Json 'GET' "$base/api/user_vocabulary_progress?page=1&pageSize=20" $null $headers
Add-Result 'user_vocabulary_progress.list' $uvpList.status $uvpList.ok "total=$($uvpList.body.total)"

$uvpUpdate = Invoke-Json 'PUT' "$base/api/user_vocabulary_progress/$uvpId" @{
    status = 2
    firstLearnedAt = (Get-Date).ToUniversalTime().AddDays(-2).ToString('o')
    lastPracticedAt = (Get-Date).ToUniversalTime().ToString('o')
    masteryLevel = 78.2
    totalPracticeCount = 15
    correctCount = 12
    bestConfidence = 92.3
    isSaved = $true
} $headers
Add-Result 'user_vocabulary_progress.update' $uvpUpdate.status $uvpUpdate.ok 'updated'

# Delete endpoints where available
$uvpDelete = Invoke-Json 'DELETE' "$base/api/user_vocabulary_progress/$uvpId" $null $headers
Add-Result 'user_vocabulary_progress.delete' $uvpDelete.status ($uvpDelete.status -eq 204) 'delete 204'

$laDelete = Invoke-Json 'DELETE' "$base/api/lesson_attempts/$lessonAttemptId" $null $headers
Add-Result 'lesson_attempts.delete' $laDelete.status ($laDelete.status -eq 204) 'delete 204'

$ulpDelete = Invoke-Json 'DELETE' "$base/api/user_lesson_progress/$ulpId" $null $headers
Add-Result 'user_lesson_progress.delete' $ulpDelete.status ($ulpDelete.status -eq 204) 'delete 204'

$results | Sort-Object Api | Format-Table -AutoSize
$failed = @($results | Where-Object { -not $_.Pass })
"FAILED_COUNT=$($failed.Count)"
if ($failed.Count -gt 0) {
    $failed | Sort-Object Api | ConvertTo-Json -Depth 8
}

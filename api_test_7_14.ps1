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

# Ensure API alive by hitting a real API route (status code may vary by auth policy)
try {
    $ping = Invoke-WebRequest -Uri "$base/api/users/login" -Method Options -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
}
catch {
    if (-not $_.Exception.Response) {
        throw "API is not reachable at $base"
    }
}

# Admin login
$adminLogin = Invoke-Json 'POST' "$base/api/users/login" @{ email = 'admin@exe101.local'; password = 'Admin@123' } @{}
if (-not $adminLogin.ok) {
    throw "Admin login failed: $($adminLogin.status)"
}
$adminToken = $adminLogin.body.accessToken
$adminUserId = $adminLogin.body.userId
$headers = @{ Authorization = "Bearer $adminToken" }
Add-Result 'admin.login' $adminLogin.status $adminLogin.ok "adminId=$adminUserId"

# Create one media asset for references
$mediaCreate = Invoke-Json 'POST' "$base/api/media_assets" @{
    ownerUserId = $adminUserId
    storageProvider = 's3'
    fileName = 'ref-media-7-14.jpg'
    fileUrl = 'https://cdn.example.com/ref-media-7-14.jpg'
    mimeType = 'image/jpeg'
    mediaType = 'image'
    fileSizeBytes = 10000
    durationSeconds = $null
    width = 640
    height = 480
    status = 2
} $headers
$mediaId = $mediaCreate.body.id
Add-Result 'media.ref.create' $mediaCreate.status $mediaCreate.ok "mediaId=$mediaId"

# 7. course_categories
$ccSlug = 'qa-course-cat-' + [Guid]::NewGuid().ToString('N').Substring(0, 8)
$ccCreate = Invoke-Json 'POST' "$base/api/course_categories" @{
    name = 'QA Course Category'
    slug = $ccSlug
    description = 'category for 7-14 tests'
    colorHex = '#11AA99'
    iconMediaId = $mediaId
} $headers
$courseCategoryId = $ccCreate.body.id
Add-Result 'course_categories.create' $ccCreate.status $ccCreate.ok "id=$courseCategoryId"

$ccGet = Invoke-Json 'GET' "$base/api/course_categories/$courseCategoryId" $null $headers
Add-Result 'course_categories.getById' $ccGet.status $ccGet.ok 'fetched'

$ccList = Invoke-Json 'GET' "$base/api/course_categories?page=1&pageSize=20" $null $headers
Add-Result 'course_categories.list' $ccList.status $ccList.ok "total=$($ccList.body.total)"

$ccUpdate = Invoke-Json 'PUT' "$base/api/course_categories/$courseCategoryId" @{
    name = 'QA Course Category Updated'
    slug = $ccSlug
    description = 'updated'
    colorHex = '#22BB99'
    iconMediaId = $mediaId
} $headers
Add-Result 'course_categories.update' $ccUpdate.status $ccUpdate.ok 'updated'

# 8. vocabulary_categories
$vcSlug = 'qa-vocab-cat-' + [Guid]::NewGuid().ToString('N').Substring(0, 8)
$vcCreate = Invoke-Json 'POST' "$base/api/vocabulary_categories" @{
    name = 'QA Vocabulary Category'
    slug = $vcSlug
    description = 'vocab cat for 7-14 tests'
    displayOrder = 1
} $headers
$vocabularyCategoryId = $vcCreate.body.id
Add-Result 'vocabulary_categories.create' $vcCreate.status $vcCreate.ok "id=$vocabularyCategoryId"

$vcGet = Invoke-Json 'GET' "$base/api/vocabulary_categories/$vocabularyCategoryId" $null $headers
Add-Result 'vocabulary_categories.getById' $vcGet.status $vcGet.ok 'fetched'

$vcList = Invoke-Json 'GET' "$base/api/vocabulary_categories?page=1&pageSize=20" $null $headers
Add-Result 'vocabulary_categories.list' $vcList.status $vcList.ok "total=$($vcList.body.total)"

$vcUpdate = Invoke-Json 'PUT' "$base/api/vocabulary_categories/$vocabularyCategoryId" @{
    name = 'QA Vocabulary Category Updated'
    slug = $vcSlug
    description = 'updated'
    displayOrder = 2
} $headers
Add-Result 'vocabulary_categories.update' $vcUpdate.status $vcUpdate.ok 'updated'

# 9. courses
$courseSlug = 'qa-course-' + [Guid]::NewGuid().ToString('N').Substring(0, 8)
$courseCreate = Invoke-Json 'POST' "$base/api/courses" @{
    categoryId = $courseCategoryId
    title = 'QA Course'
    slug = $courseSlug
    summary = 'summary'
    description = 'description'
    level = 'beginner'
    coverMediaId = $mediaId
    trailerMediaId = $mediaId
    isPremium = $false
    createdBy = $adminUserId
} $headers
$courseId = $courseCreate.body.id
Add-Result 'courses.create' $courseCreate.status $courseCreate.ok "id=$courseId"

$courseGet = Invoke-Json 'GET' "$base/api/courses/$courseId" $null $headers
Add-Result 'courses.getById' $courseGet.status $courseGet.ok 'fetched'

$courseList = Invoke-Json 'GET' "$base/api/courses?page=1&pageSize=20" $null $headers
Add-Result 'courses.list' $courseList.status $courseList.ok "total=$($courseList.body.total)"

$courseUpdate = Invoke-Json 'PUT' "$base/api/courses/$courseId" @{
    categoryId = $courseCategoryId
    title = 'QA Course Updated'
    slug = $courseSlug
    summary = 'summary updated'
    description = 'description updated'
    level = 'beginner'
    coverMediaId = $mediaId
    trailerMediaId = $mediaId
    isPremium = $true
    updatedBy = $adminUserId
} $headers
Add-Result 'courses.update' $courseUpdate.status $courseUpdate.ok 'updated'

$coursePublish = Invoke-Json 'POST' "$base/api/courses/$courseId/publish" @{ updatedBy = $adminUserId } $headers
Add-Result 'courses.publish' $coursePublish.status $coursePublish.ok 'published'

$courseUnpublish = Invoke-Json 'POST' "$base/api/courses/$courseId/unpublish" @{ updatedBy = $adminUserId } $headers
Add-Result 'courses.unpublish' $courseUnpublish.status $courseUnpublish.ok 'unpublished'

# 10. course_modules
$cmCreate = Invoke-Json 'POST' "$base/api/course_modules" @{
    courseId = $courseId
    title = 'QA Module'
    description = 'module desc'
    sortOrder = 1
    isPreview = $true
} $headers
$courseModuleId = $cmCreate.body.id
Add-Result 'course_modules.create' $cmCreate.status $cmCreate.ok "id=$courseModuleId"

$cmGet = Invoke-Json 'GET' "$base/api/course_modules/$courseModuleId" $null $headers
Add-Result 'course_modules.getById' $cmGet.status $cmGet.ok 'fetched'

$cmList = Invoke-Json 'GET' "$base/api/course_modules?page=1&pageSize=20" $null $headers
Add-Result 'course_modules.list' $cmList.status $cmList.ok "total=$($cmList.body.total)"

$cmUpdate = Invoke-Json 'PUT' "$base/api/course_modules/$courseModuleId" @{
    courseId = $courseId
    title = 'QA Module Updated'
    description = 'module desc updated'
    sortOrder = 2
    isPreview = $false
} $headers
Add-Result 'course_modules.update' $cmUpdate.status $cmUpdate.ok 'updated'

# 11. lessons
$lessonSlug = 'qa-lesson-' + [Guid]::NewGuid().ToString('N').Substring(0, 8)
$lessonCreate = Invoke-Json 'POST' "$base/api/lessons" @{
    courseId = $courseId
    moduleId = $courseModuleId
    title = 'QA Lesson'
    slug = $lessonSlug
    shortDescription = 'short desc'
    objectiveText = 'objective'
    coverMediaId = $mediaId
    videoMediaId = $mediaId
    lessonType = 'video'
    difficultyLevel = 'easy'
    estimatedMinutes = 15
    xpReward = 20
    sortOrder = 1
} $headers
$lessonId = $lessonCreate.body.id
Add-Result 'lessons.create' $lessonCreate.status $lessonCreate.ok "id=$lessonId"

$lessonGet = Invoke-Json 'GET' "$base/api/lessons/$lessonId" $null $headers
Add-Result 'lessons.getById' $lessonGet.status $lessonGet.ok 'fetched'

$lessonList = Invoke-Json 'GET' "$base/api/lessons?page=1&pageSize=20" $null $headers
Add-Result 'lessons.list' $lessonList.status $lessonList.ok "total=$($lessonList.body.total)"

$lessonUpdate = Invoke-Json 'PUT' "$base/api/lessons/$lessonId" @{
    courseId = $courseId
    moduleId = $courseModuleId
    title = 'QA Lesson Updated'
    slug = $lessonSlug
    shortDescription = 'short desc updated'
    objectiveText = 'objective updated'
    coverMediaId = $mediaId
    videoMediaId = $mediaId
    lessonType = 'video'
    difficultyLevel = 'easy'
    estimatedMinutes = 20
    xpReward = 25
    sortOrder = 2
    status = 0
} $headers
Add-Result 'lessons.update' $lessonUpdate.status $lessonUpdate.ok 'updated'

# 12. vocabularies
$vocabCode = 'QA_VOC_' + [Guid]::NewGuid().ToString('N').Substring(0, 6)
$vocabCreate = Invoke-Json 'POST' "$base/api/vocabularies" @{
    categoryId = $vocabularyCategoryId
    code = $vocabCode
    termVi = 'xin chao qa'
    description = 'desc'
    usageExample = 'usage'
    difficultyLevel = 'easy'
    handHintText = 'hint'
    isFeatured = $true
    createdBy = $adminUserId
} $headers
$vocabularyId = $vocabCreate.body.id
Add-Result 'vocabularies.create' $vocabCreate.status $vocabCreate.ok "id=$vocabularyId"

$vocabGet = Invoke-Json 'GET' "$base/api/vocabularies/$vocabularyId" $null $headers
Add-Result 'vocabularies.getById' $vocabGet.status $vocabGet.ok 'fetched'

$vocabList = Invoke-Json 'GET' "$base/api/vocabularies?page=1&pageSize=20" $null $headers
Add-Result 'vocabularies.list' $vocabList.status $vocabList.ok "total=$($vocabList.body.total)"

$vocabUpdate = Invoke-Json 'PUT' "$base/api/vocabularies/$vocabularyId" @{
    categoryId = $vocabularyCategoryId
    code = $vocabCode
    termVi = 'xin chao qa updated'
    description = 'desc updated'
    usageExample = 'usage updated'
    difficultyLevel = 'easy'
    handHintText = 'hint updated'
    isFeatured = $false
    status = 0
} $headers
Add-Result 'vocabularies.update' $vocabUpdate.status $vocabUpdate.ok 'updated'

# 13. vocabulary_media
$vmCreate = Invoke-Json 'POST' "$base/api/vocabulary_media" @{
    vocabularyId = $vocabularyId
    mediaId = $mediaId
    usageType = 'thumbnail'
    isPrimary = $true
    sortOrder = 1
} $headers
$vocabularyMediaId = $vmCreate.body.id
Add-Result 'vocabulary_media.create' $vmCreate.status $vmCreate.ok "id=$vocabularyMediaId"

$vmGet = Invoke-Json 'GET' "$base/api/vocabulary_media/$vocabularyMediaId" $null $headers
Add-Result 'vocabulary_media.getById' $vmGet.status $vmGet.ok 'fetched'

$vmList = Invoke-Json 'GET' "$base/api/vocabulary_media?page=1&pageSize=20" $null $headers
Add-Result 'vocabulary_media.list' $vmList.status $vmList.ok "total=$($vmList.body.total)"

$vmUpdate = Invoke-Json 'PUT' "$base/api/vocabulary_media/$vocabularyMediaId" @{
    vocabularyId = $vocabularyId
    mediaId = $mediaId
    usageType = 'demo'
    isPrimary = $false
    sortOrder = 2
} $headers
Add-Result 'vocabulary_media.update' $vmUpdate.status $vmUpdate.ok 'updated'

# 14. lesson_vocabularies
$lvCreate = Invoke-Json 'POST' "$base/api/lesson_vocabularies" @{
    lessonId = $lessonId
    vocabularyId = $vocabularyId
    sortOrder = 1
    isRequired = $true
    expectedAccuracy = 85.5
} $headers
$lessonVocabularyId = $lvCreate.body.id
Add-Result 'lesson_vocabularies.create' $lvCreate.status $lvCreate.ok "id=$lessonVocabularyId"

$lvGet = Invoke-Json 'GET' "$base/api/lesson_vocabularies/$lessonVocabularyId" $null $headers
Add-Result 'lesson_vocabularies.getById' $lvGet.status $lvGet.ok 'fetched'

$lvList = Invoke-Json 'GET' "$base/api/lesson_vocabularies?page=1&pageSize=20" $null $headers
Add-Result 'lesson_vocabularies.list' $lvList.status $lvList.ok "total=$($lvList.body.total)"

$lvUpdate = Invoke-Json 'PUT' "$base/api/lesson_vocabularies/$lessonVocabularyId" @{
    lessonId = $lessonId
    vocabularyId = $vocabularyId
    sortOrder = 2
    isRequired = $false
    expectedAccuracy = 90.0
} $headers
Add-Result 'lesson_vocabularies.update' $lvUpdate.status $lvUpdate.ok 'updated'

# delete checks in reverse dependency order
$lvDelete = Invoke-Json 'DELETE' "$base/api/lesson_vocabularies/$lessonVocabularyId" $null $headers
Add-Result 'lesson_vocabularies.delete' $lvDelete.status ($lvDelete.status -eq 204) 'delete 204'

$vmDelete = Invoke-Json 'DELETE' "$base/api/vocabulary_media/$vocabularyMediaId" $null $headers
Add-Result 'vocabulary_media.delete' $vmDelete.status ($vmDelete.status -eq 204) 'delete 204'

$lessonDelete = Invoke-Json 'DELETE' "$base/api/lessons/$lessonId" $null $headers
Add-Result 'lessons.delete' $lessonDelete.status ($lessonDelete.status -eq 204) 'delete 204'

$cmDelete = Invoke-Json 'DELETE' "$base/api/course_modules/$courseModuleId" $null $headers
Add-Result 'course_modules.delete' $cmDelete.status ($cmDelete.status -eq 204) 'delete 204'

$vocabDelete = Invoke-Json 'DELETE' "$base/api/vocabularies/$vocabularyId" $null $headers
Add-Result 'vocabularies.delete' $vocabDelete.status ($vocabDelete.status -eq 204) 'delete 204'

$ccDeleteSlug = 'qa-course-cat-del-' + [Guid]::NewGuid().ToString('N').Substring(0, 8)
$ccDeleteProbe = Invoke-Json 'POST' "$base/api/course_categories" @{
    name = 'QA Course Category Delete Probe'
    slug = $ccDeleteSlug
    description = 'independent delete check'
    colorHex = '#1188AA'
    iconMediaId = $mediaId
} $headers

if ($ccDeleteProbe.ok) {
    $ccDelete = Invoke-Json 'DELETE' "$base/api/course_categories/$($ccDeleteProbe.body.id)" $null $headers
    Add-Result 'course_categories.delete' $ccDelete.status ($ccDelete.status -eq 204) 'delete independent record'
}
else {
    Add-Result 'course_categories.delete' $ccDeleteProbe.status $false 'could not create delete probe'
}

$vcDelete = Invoke-Json 'DELETE' "$base/api/vocabulary_categories/$vocabularyCategoryId" $null $headers
Add-Result 'vocabulary_categories.delete' $vcDelete.status ($vcDelete.status -eq 204) 'delete 204'

$results | Sort-Object Api | Format-Table -AutoSize
$failed = @($results | Where-Object { -not $_.Pass })
"FAILED_COUNT=$($failed.Count)"
if ($failed.Count -gt 0) {
    $failed | Sort-Object Api | ConvertTo-Json -Depth 8
}

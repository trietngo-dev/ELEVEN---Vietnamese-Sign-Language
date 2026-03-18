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

# Setup: role + user
$roles = Invoke-Json 'GET' "$base/api/roles?page=1&pageSize=100" $null $headers
$userRole = $roles.body.items | Where-Object { $_.code -eq 'user' } | Select-Object -First 1
if (-not $userRole) { throw 'User role missing.' }

$testEmail = "qa1932.$([Guid]::NewGuid().ToString('N').Substring(0,6))@mail.test"
$userCreate = Invoke-Json 'POST' "$base/api/users" @{
    roleId = $userRole.id
    email = $testEmail
    password = 'User@123456'
    fullName = 'QA 19-32 User'
    avatarMediaId = $null
    status = 0
} $headers
if (-not $userCreate.ok) { throw "Cannot create test user: $($userCreate.status)" }
$testUserId = $userCreate.body.id
Add-Result 'setup.user.create' $userCreate.status $true "userId=$testUserId"

# Setup: media for badge icon
$mediaCreate = Invoke-Json 'POST' "$base/api/media_assets" @{
    ownerUserId = $adminUserId
    storageProvider = 's3'
    fileName = 'qa1932-badge.jpg'
    fileUrl = 'https://cdn.example.com/qa1932-badge.jpg'
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

# Setup: vocabulary category + vocabulary for matched/expected vocabulary references
$vocabCatSlug = 'qa1932-vocabcat-' + [Guid]::NewGuid().ToString('N').Substring(0, 8)
$vocabCat = Invoke-Json 'POST' "$base/api/vocabulary_categories" @{
    name = 'QA1932 Vocabulary Category'
    slug = $vocabCatSlug
    description = 'for test 19-32'
    displayOrder = 1
} $headers
if (-not $vocabCat.ok) { throw "Cannot create vocabulary category: $($vocabCat.status)" }
$vocabularyCategoryId = $vocabCat.body.id
Add-Result 'setup.vocabulary_category.create' $vocabCat.status $true "id=$vocabularyCategoryId"

$vocabCode = 'QA1932_' + [Guid]::NewGuid().ToString('N').Substring(0, 6)
$vocabularyCreate = Invoke-Json 'POST' "$base/api/vocabularies" @{
    categoryId = $vocabularyCategoryId
    code = $vocabCode
    termVi = 'qa 19 32 tu vung'
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

# 19) translation_sessions
$tsCreate = Invoke-Json 'POST' "$base/api/translation_sessions" @{
    userId = $testUserId
    inputMode = 'camera'
    outputMode = 'text'
    signVariantUsed = 'vsl'
} $headers
$translationSessionId = $tsCreate.body.id
Add-Result 'translation_sessions.create' $tsCreate.status $tsCreate.ok "id=$translationSessionId"

$tsGet = Invoke-Json 'GET' "$base/api/translation_sessions/$translationSessionId" $null $headers
Add-Result 'translation_sessions.getById' $tsGet.status $tsGet.ok 'fetched'

$tsList = Invoke-Json 'GET' "$base/api/translation_sessions?page=1&pageSize=20" $null $headers
Add-Result 'translation_sessions.list' $tsList.status $tsList.ok "total=$($tsList.body.total)"

$tsUpdate = Invoke-Json 'PUT' "$base/api/translation_sessions/$translationSessionId" @{
    status = 2
    finalText = 'xin chao'
    finalAudioMediaId = $null
    averageConfidence = 92.5
    endedAt = (Get-Date).ToUniversalTime().ToString('o')
} $headers
Add-Result 'translation_sessions.update' $tsUpdate.status $tsUpdate.ok 'updated'

# 20) translation_segments
$tsegCreate = Invoke-Json 'POST' "$base/api/translation_segments" @{
    sessionId = $translationSessionId
    segmentOrder = 1
    recognizedText = 'xin chao'
    confidence = 91.2
    matchedVocabularyId = $vocabularyId
    startedAt = (Get-Date).ToUniversalTime().AddSeconds(-5).ToString('o')
    endedAt = (Get-Date).ToUniversalTime().ToString('o')
    audioMediaId = $null
    rawPredictionJson = '{"top1":"xin chao"}'
} $headers
$translationSegmentId = $tsegCreate.body.id
Add-Result 'translation_segments.create' $tsegCreate.status $tsegCreate.ok "id=$translationSegmentId"

$tsegGet = Invoke-Json 'GET' "$base/api/translation_segments/$translationSegmentId" $null $headers
Add-Result 'translation_segments.getById' $tsegGet.status $tsegGet.ok 'fetched'

$tsegList = Invoke-Json 'GET' "$base/api/translation_segments?page=1&pageSize=20" $null $headers
Add-Result 'translation_segments.list' $tsegList.status $tsegList.ok "total=$($tsegList.body.total)"

$tsegUpdate = Invoke-Json 'PUT' "$base/api/translation_segments/$translationSegmentId" @{
    segmentOrder = 2
    recognizedText = 'xin chao updated'
    confidence = 93.1
    matchedVocabularyId = $vocabularyId
    startedAt = (Get-Date).ToUniversalTime().AddSeconds(-7).ToString('o')
    endedAt = (Get-Date).ToUniversalTime().ToString('o')
    audioMediaId = $null
    rawPredictionJson = '{"top1":"xin chao updated"}'
} $headers
Add-Result 'translation_segments.update' $tsegUpdate.status $tsegUpdate.ok 'updated'

# 21) practice_sessions
$psCreate = Invoke-Json 'POST' "$base/api/practice_sessions" @{
    userId = $testUserId
    courseId = $null
    lessonId = $null
    vocabularyId = $vocabularyId
    mode = 'vocabulary'
    promptText = 'please sign xin chao'
    totalItems = 5
} $headers
$practiceSessionId = $psCreate.body.id
Add-Result 'practice_sessions.create' $psCreate.status $psCreate.ok "id=$practiceSessionId"

$psGet = Invoke-Json 'GET' "$base/api/practice_sessions/$practiceSessionId" $null $headers
Add-Result 'practice_sessions.getById' $psGet.status $psGet.ok 'fetched'

$psList = Invoke-Json 'GET' "$base/api/practice_sessions?page=1&pageSize=20" $null $headers
Add-Result 'practice_sessions.list' $psList.status $psList.ok "total=$($psList.body.total)"

$psUpdate = Invoke-Json 'PUT' "$base/api/practice_sessions/$practiceSessionId" @{
    status = 2
    totalItems = 5
    correctItems = 4
    accuracy = 80.0
    endedAt = (Get-Date).ToUniversalTime().ToString('o')
    notes = 'good run'
} $headers
Add-Result 'practice_sessions.update' $psUpdate.status $psUpdate.ok 'updated'

# 22) practice_attempts
$paCreate = Invoke-Json 'POST' "$base/api/practice_attempts" @{
    practiceSessionId = $practiceSessionId
    expectedVocabularyId = $vocabularyId
    recognizedVocabularyId = $vocabularyId
    expectedText = 'xin chao'
    recognizedText = 'xin chao'
    confidence = 95.0
    isCorrect = $true
    responseTimeMs = 1400
    feedbackText = 'great'
    sortOrder = 1
} $headers
$practiceAttemptId = $paCreate.body.id
Add-Result 'practice_attempts.create' $paCreate.status $paCreate.ok "id=$practiceAttemptId"

$paGet = Invoke-Json 'GET' "$base/api/practice_attempts/$practiceAttemptId" $null $headers
Add-Result 'practice_attempts.getById' $paGet.status $paGet.ok 'fetched'

$paList = Invoke-Json 'GET' "$base/api/practice_attempts?page=1&pageSize=20" $null $headers
Add-Result 'practice_attempts.list' $paList.status $paList.ok "total=$($paList.body.total)"

$paUpdate = Invoke-Json 'PUT' "$base/api/practice_attempts/$practiceAttemptId" @{
    expectedVocabularyId = $vocabularyId
    recognizedVocabularyId = $vocabularyId
    expectedText = 'xin chao'
    recognizedText = 'xin chao updated'
    confidence = 89.0
    isCorrect = $true
    responseTimeMs = 1600
    feedbackText = 'updated'
    sortOrder = 2
} $headers
Add-Result 'practice_attempts.update' $paUpdate.status $paUpdate.ok 'updated'

# 23) subscription_plans
$planCode = 'QA_PLAN_' + [Guid]::NewGuid().ToString('N').Substring(0, 8).ToUpper()
$spCreate = Invoke-Json 'POST' "$base/api/subscription_plans" @{
    code = $planCode
    name = 'QA Plan'
    billingCycle = 'monthly'
    priceVnd = 99000
    dailyTranslationLimit = 100
    aiPracticeLimit = 100
    courseAccessScope = 'all'
    canSaveHistory = $true
    certificateEnabled = $true
    prioritySupport = $false
    isActive = $true
    displayOrder = 1
} $headers
$subscriptionPlanId = $spCreate.body.id
Add-Result 'subscription_plans.create' $spCreate.status $spCreate.ok "id=$subscriptionPlanId"

$spGet = Invoke-Json 'GET' "$base/api/subscription_plans/$subscriptionPlanId" $null $headers
Add-Result 'subscription_plans.getById' $spGet.status $spGet.ok 'fetched'

$spList = Invoke-Json 'GET' "$base/api/subscription_plans?page=1&pageSize=20" $null $headers
Add-Result 'subscription_plans.list' $spList.status $spList.ok "total=$($spList.body.total)"

$spUpdate = Invoke-Json 'PUT' "$base/api/subscription_plans/$subscriptionPlanId" @{
    code = $planCode
    name = 'QA Plan Updated'
    billingCycle = 'monthly'
    priceVnd = 149000
    dailyTranslationLimit = 120
    aiPracticeLimit = 120
    courseAccessScope = 'all'
    canSaveHistory = $true
    certificateEnabled = $true
    prioritySupport = $true
    isActive = $true
    displayOrder = 2
} $headers
Add-Result 'subscription_plans.update' $spUpdate.status $spUpdate.ok 'updated'

# 24) user_subscriptions
$usCreate = Invoke-Json 'POST' "$base/api/user_subscriptions" @{
    userId = $testUserId
    planId = $subscriptionPlanId
    status = 0
    startAt = (Get-Date).ToUniversalTime().ToString('o')
    endAt = (Get-Date).ToUniversalTime().AddDays(30).ToString('o')
    autoRenew = $true
    source = 'qa-test'
} $headers
$userSubscriptionId = $usCreate.body.id
Add-Result 'user_subscriptions.create' $usCreate.status $usCreate.ok "id=$userSubscriptionId"

$usGet = Invoke-Json 'GET' "$base/api/user_subscriptions/$userSubscriptionId" $null $headers
Add-Result 'user_subscriptions.getById' $usGet.status $usGet.ok 'fetched'

$usList = Invoke-Json 'GET' "$base/api/user_subscriptions?page=1&pageSize=20" $null $headers
Add-Result 'user_subscriptions.list' $usList.status $usList.ok "total=$($usList.body.total)"

$usUpdate = Invoke-Json 'PUT' "$base/api/user_subscriptions/$userSubscriptionId" @{
    planId = $subscriptionPlanId
    status = 0
    startAt = (Get-Date).ToUniversalTime().AddDays(-1).ToString('o')
    endAt = (Get-Date).ToUniversalTime().AddDays(29).ToString('o')
    autoRenew = $false
    source = 'qa-test-updated'
} $headers
Add-Result 'user_subscriptions.update' $usUpdate.status $usUpdate.ok 'updated'

# 25) payment_transactions
$ptCreate = Invoke-Json 'POST' "$base/api/payment_transactions" @{
    userId = $testUserId
    userSubscriptionId = $userSubscriptionId
    amountVnd = 149000
    currency = 'VND'
    paymentMethod = 'vnpay'
    paymentProvider = 'vnpay'
    providerTransactionRef = ('ref_' + [Guid]::NewGuid().ToString('N').Substring(0, 8))
    status = 1
    paidAt = (Get-Date).ToUniversalTime().ToString('o')
} $headers
$paymentTransactionId = $ptCreate.body.id
Add-Result 'payment_transactions.create' $ptCreate.status $ptCreate.ok "id=$paymentTransactionId"

$ptGet = Invoke-Json 'GET' "$base/api/payment_transactions/$paymentTransactionId" $null $headers
Add-Result 'payment_transactions.getById' $ptGet.status $ptGet.ok 'fetched'

$ptList = Invoke-Json 'GET' "$base/api/payment_transactions?page=1&pageSize=20" $null $headers
Add-Result 'payment_transactions.list' $ptList.status $ptList.ok "total=$($ptList.body.total)"

$ptUpdate = Invoke-Json 'PUT' "$base/api/payment_transactions/$paymentTransactionId" @{
    userSubscriptionId = $userSubscriptionId
    amountVnd = 149000
    currency = 'VND'
    paymentMethod = 'vnpay'
    paymentProvider = 'vnpay'
    providerTransactionRef = ('ref_update_' + [Guid]::NewGuid().ToString('N').Substring(0, 8))
    status = 1
    paidAt = (Get-Date).ToUniversalTime().ToString('o')
} $headers
Add-Result 'payment_transactions.update' $ptUpdate.status $ptUpdate.ok 'updated'

# 26) notifications
$nfCreate = Invoke-Json 'POST' "$base/api/notifications" @{
    userId = $testUserId
    title = 'QA notification'
    message = 'message body'
    type = 'system'
    isRead = $false
    actionUrl = '/dashboard'
} $headers
$notificationId = $nfCreate.body.id
Add-Result 'notifications.create' $nfCreate.status $nfCreate.ok "id=$notificationId"

$nfGet = Invoke-Json 'GET' "$base/api/notifications/$notificationId" $null $headers
Add-Result 'notifications.getById' $nfGet.status $nfGet.ok 'fetched'

$nfList = Invoke-Json 'GET' "$base/api/notifications?page=1&pageSize=20" $null $headers
Add-Result 'notifications.list' $nfList.status $nfList.ok "total=$($nfList.body.total)"

$nfUpdate = Invoke-Json 'PUT' "$base/api/notifications/$notificationId" @{
    title = 'QA notification updated'
    message = 'message body updated'
    type = 'system'
    isRead = $true
    actionUrl = '/notifications'
    readAt = (Get-Date).ToUniversalTime().ToString('o')
} $headers
Add-Result 'notifications.update' $nfUpdate.status $nfUpdate.ok 'updated'

# 27) feedback_categories
$fcCreate = Invoke-Json 'POST' "$base/api/feedback_categories" @{
    name = 'QA Feedback Category'
    description = 'for api 19-32'
    isActive = $true
} $headers
$feedbackCategoryId = $fcCreate.body.id
Add-Result 'feedback_categories.create' $fcCreate.status $fcCreate.ok "id=$feedbackCategoryId"

$fcGet = Invoke-Json 'GET' "$base/api/feedback_categories/$feedbackCategoryId" $null $headers
Add-Result 'feedback_categories.getById' $fcGet.status $fcGet.ok 'fetched'

$fcList = Invoke-Json 'GET' "$base/api/feedback_categories?page=1&pageSize=20" $null $headers
Add-Result 'feedback_categories.list' $fcList.status $fcList.ok "total=$($fcList.body.total)"

$fcUpdate = Invoke-Json 'PUT' "$base/api/feedback_categories/$feedbackCategoryId" @{
    name = 'QA Feedback Category Updated'
    description = 'updated'
    isActive = $true
} $headers
Add-Result 'feedback_categories.update' $fcUpdate.status $fcUpdate.ok 'updated'

# 28) feedbacks
$fbCreate = Invoke-Json 'POST' "$base/api/feedbacks" @{
    userId = $testUserId
    categoryId = $feedbackCategoryId
    rating = 5
    subject = 'great app'
    content = 'really useful platform'
} $headers
$feedbackId = $fbCreate.body.id
Add-Result 'feedbacks.create' $fbCreate.status $fbCreate.ok "id=$feedbackId"

$fbGet = Invoke-Json 'GET' "$base/api/feedbacks/$feedbackId" $null $headers
Add-Result 'feedbacks.getById' $fbGet.status $fbGet.ok 'fetched'

$fbList = Invoke-Json 'GET' "$base/api/feedbacks?page=1&pageSize=20" $null $headers
Add-Result 'feedbacks.list' $fbList.status $fbList.ok "total=$($fbList.body.total)"

$fbUpdate = Invoke-Json 'PUT' "$base/api/feedbacks/$feedbackId" @{
    categoryId = $feedbackCategoryId
    rating = 4
    subject = 'great app updated'
    content = 'still good'
    status = 2
    adminReply = 'Thanks for your feedback'
    respondedBy = $adminUserId
    respondedAt = (Get-Date).ToUniversalTime().ToString('o')
} $headers
Add-Result 'feedbacks.update' $fbUpdate.status $fbUpdate.ok 'updated'

# 29) badges
$badgeCode = 'QA_BADGE_' + [Guid]::NewGuid().ToString('N').Substring(0, 6).ToUpper()
$bdCreate = Invoke-Json 'POST' "$base/api/badges" @{
    code = $badgeCode
    name = 'QA Badge'
    description = 'qa badge description'
    badgeType = 0
    iconMediaId = $mediaId
    criteriaJson = '{"xp":100}'
} $headers
$badgeId = $bdCreate.body.id
Add-Result 'badges.create' $bdCreate.status $bdCreate.ok "id=$badgeId"

$bdGet = Invoke-Json 'GET' "$base/api/badges/$badgeId" $null $headers
Add-Result 'badges.getById' $bdGet.status $bdGet.ok 'fetched'

$bdList = Invoke-Json 'GET' "$base/api/badges?page=1&pageSize=20" $null $headers
Add-Result 'badges.list' $bdList.status $bdList.ok "total=$($bdList.body.total)"

$bdUpdate = Invoke-Json 'PUT' "$base/api/badges/$badgeId" @{
    code = $badgeCode
    name = 'QA Badge Updated'
    description = 'qa badge description updated'
    badgeType = 1
    iconMediaId = $mediaId
    criteriaJson = '{"xp":200}'
} $headers
Add-Result 'badges.update' $bdUpdate.status $bdUpdate.ok 'updated'

# 30) user_badges
$ubCreate = Invoke-Json 'POST' "$base/api/user_badges" @{
    userId = $testUserId
    badgeId = $badgeId
    awardedAt = (Get-Date).ToUniversalTime().ToString('o')
} $headers
$userBadgeId = $ubCreate.body.id
Add-Result 'user_badges.create' $ubCreate.status $ubCreate.ok "id=$userBadgeId"

$ubGet = Invoke-Json 'GET' "$base/api/user_badges/$userBadgeId" $null $headers
Add-Result 'user_badges.getById' $ubGet.status $ubGet.ok 'fetched'

$ubList = Invoke-Json 'GET' "$base/api/user_badges?page=1&pageSize=20" $null $headers
Add-Result 'user_badges.list' $ubList.status $ubList.ok "total=$($ubList.body.total)"

$ubUpdate = Invoke-Json 'PUT' "$base/api/user_badges/$userBadgeId" @{
    badgeId = $badgeId
    awardedAt = (Get-Date).ToUniversalTime().AddMinutes(1).ToString('o')
} $headers
Add-Result 'user_badges.update' $ubUpdate.status $ubUpdate.ok 'updated'

# 31) user_activity_logs
$ualCreate = Invoke-Json 'POST' "$base/api/user_activity_logs" @{
    userId = $testUserId
    actionType = 'practice_completed'
    entityType = 'practice_session'
    entityId = $practiceSessionId
    metadataJson = '{"accuracy":80.0}'
} $headers
$userActivityLogId = $ualCreate.body.id
Add-Result 'user_activity_logs.create' $ualCreate.status $ualCreate.ok "id=$userActivityLogId"

$ualGet = Invoke-Json 'GET' "$base/api/user_activity_logs/$userActivityLogId" $null $headers
Add-Result 'user_activity_logs.getById' $ualGet.status $ualGet.ok 'fetched'

$ualList = Invoke-Json 'GET' "$base/api/user_activity_logs?page=1&pageSize=20" $null $headers
Add-Result 'user_activity_logs.list' $ualList.status $ualList.ok "total=$($ualList.body.total)"

# 32) admin_action_logs
$aalCreate = Invoke-Json 'POST' "$base/api/admin_action_logs" @{
    adminUserId = $adminUserId
    actionType = 'update_feedback'
    entityType = 'feedback'
    entityId = $feedbackId
    description = 'admin responded feedback'
} $headers
$adminActionLogId = $aalCreate.body.id
Add-Result 'admin_action_logs.create' $aalCreate.status $aalCreate.ok "id=$adminActionLogId"

$aalGet = Invoke-Json 'GET' "$base/api/admin_action_logs/$adminActionLogId" $null $headers
Add-Result 'admin_action_logs.getById' $aalGet.status $aalGet.ok 'fetched'

$aalList = Invoke-Json 'GET' "$base/api/admin_action_logs?page=1&pageSize=20" $null $headers
Add-Result 'admin_action_logs.list' $aalList.status $aalList.ok "total=$($aalList.body.total)"

# Delete checks in reverse dependency order
$ubDelete = Invoke-Json 'DELETE' "$base/api/user_badges/$userBadgeId" $null $headers
Add-Result 'user_badges.delete' $ubDelete.status ($ubDelete.status -eq 204) 'delete 204'

$bdDelete = Invoke-Json 'DELETE' "$base/api/badges/$badgeId" $null $headers
Add-Result 'badges.delete' $bdDelete.status ($bdDelete.status -eq 204) 'delete 204'

$fbDelete = Invoke-Json 'DELETE' "$base/api/feedbacks/$feedbackId" $null $headers
Add-Result 'feedbacks.delete' $fbDelete.status ($fbDelete.status -eq 204) 'delete 204'

$fcDelete = Invoke-Json 'DELETE' "$base/api/feedback_categories/$feedbackCategoryId" $null $headers
Add-Result 'feedback_categories.delete' $fcDelete.status ($fcDelete.status -eq 204) 'delete 204'

$nfDelete = Invoke-Json 'DELETE' "$base/api/notifications/$notificationId" $null $headers
Add-Result 'notifications.delete' $nfDelete.status ($nfDelete.status -eq 204) 'delete 204'

$ptDelete = Invoke-Json 'DELETE' "$base/api/payment_transactions/$paymentTransactionId" $null $headers
Add-Result 'payment_transactions.delete' $ptDelete.status ($ptDelete.status -eq 204) 'delete 204'

$usDelete = Invoke-Json 'DELETE' "$base/api/user_subscriptions/$userSubscriptionId" $null $headers
Add-Result 'user_subscriptions.delete' $usDelete.status ($usDelete.status -eq 204) 'delete 204'

$spDelete = Invoke-Json 'DELETE' "$base/api/subscription_plans/$subscriptionPlanId" $null $headers
Add-Result 'subscription_plans.delete' $spDelete.status ($spDelete.status -eq 204) 'delete 204'

$paDelete = Invoke-Json 'DELETE' "$base/api/practice_attempts/$practiceAttemptId" $null $headers
Add-Result 'practice_attempts.delete' $paDelete.status ($paDelete.status -eq 204) 'delete 204'

$psDelete = Invoke-Json 'DELETE' "$base/api/practice_sessions/$practiceSessionId" $null $headers
Add-Result 'practice_sessions.delete' $psDelete.status ($psDelete.status -eq 204) 'delete 204'

$tsegDelete = Invoke-Json 'DELETE' "$base/api/translation_segments/$translationSegmentId" $null $headers
Add-Result 'translation_segments.delete' $tsegDelete.status ($tsegDelete.status -eq 204) 'delete 204'

$tsDelete = Invoke-Json 'DELETE' "$base/api/translation_sessions/$translationSessionId" $null $headers
Add-Result 'translation_sessions.delete' $tsDelete.status ($tsDelete.status -eq 204) 'delete 204'

# cleanup setup records
$vocabDelete = Invoke-Json 'DELETE' "$base/api/vocabularies/$vocabularyId" $null $headers
Add-Result 'setup.vocabulary.delete' $vocabDelete.status ($vocabDelete.status -eq 204) 'delete 204'

$vocabCatDelete = Invoke-Json 'DELETE' "$base/api/vocabulary_categories/$vocabularyCategoryId" $null $headers
Add-Result 'setup.vocabulary_category.delete' $vocabCatDelete.status ($vocabCatDelete.status -eq 204) 'delete 204'

$userDelete = Invoke-Json 'DELETE' "$base/api/users/$testUserId" $null $headers
Add-Result 'setup.user.delete' $userDelete.status ($userDelete.status -eq 204) 'delete 204'

$mediaDelete = Invoke-Json 'DELETE' "$base/api/media_assets/$mediaId" $null $headers
Add-Result 'setup.media.delete' $mediaDelete.status (($mediaDelete.status -eq 200) -or ($mediaDelete.status -eq 204)) 'archive/delete endpoint'

$results | Sort-Object Api | Format-Table -AutoSize
$failed = @($results | Where-Object { -not $_.Pass })
"FAILED_COUNT=$($failed.Count)"
if ($failed.Count -gt 0) {
    $failed | Sort-Object Api | ConvertTo-Json -Depth 10
}

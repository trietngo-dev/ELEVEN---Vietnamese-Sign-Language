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
    $params = @{
        Method = $method
        Uri = $url
        Headers = $headers
        ContentType = 'application/json'
    }

    if ($null -ne $body) {
        $params.Body = ($body | ConvertTo-Json -Depth 10)
    }

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

# Admin login
$login = Invoke-Json 'POST' "$base/api/users/login" @{ email = 'admin@exe101.local'; password = 'Admin@123' } @{}
if (-not $login.ok) {
    throw "Admin login failed: $($login.status) $($login.body | ConvertTo-Json -Compress)"
}
$adminToken = $login.body.accessToken
$adminHeaders = @{ Authorization = "Bearer $adminToken" }
Add-Result 'users.login.admin' $login.status $true 'admin token issued'

# 1) roles
$roleCode = 'qa_role_' + [Guid]::NewGuid().ToString('N').Substring(0, 8)
$roleCreate = Invoke-Json 'POST' "$base/api/roles" @{ code = $roleCode; name = 'QA Role'; description = 'created by api test' } $adminHeaders
$roleId = $roleCreate.body.id
Add-Result 'roles.create' $roleCreate.status $roleCreate.ok "id=$roleId"

$roleGet = Invoke-Json 'GET' "$base/api/roles/$roleId" $null $adminHeaders
Add-Result 'roles.getById' $roleGet.status $roleGet.ok 'fetch created role'

$roleList = Invoke-Json 'GET' "$base/api/roles?page=1&pageSize=50" $null $adminHeaders
Add-Result 'roles.list' $roleList.status $roleList.ok "total=$($roleList.body.total)"

$roleUpdate = Invoke-Json 'PUT' "$base/api/roles/$roleId" @{ code = $roleCode; name = 'QA Role Updated'; description = 'updated' } $adminHeaders
Add-Result 'roles.update' $roleUpdate.status $roleUpdate.ok 'updated role'

$roleDelete = Invoke-Json 'DELETE' "$base/api/roles/$roleId" $null $adminHeaders
Add-Result 'roles.delete' $roleDelete.status ($roleDelete.status -eq 204) 'delete returns 204'

# Lookup user role
$userRole = $null
if ($roleList.ok -and $roleList.body.items) {
    $userRole = ($roleList.body.items | Where-Object { $_.code -eq 'user' } | Select-Object -First 1)
}
if (-not $userRole) {
    throw 'User role not found for users tests.'
}

# 2) users CRUD + extras
$emailCreate = "qa.create.$([Guid]::NewGuid().ToString('N').Substring(0,6))@mail.test"
$userCreate = Invoke-Json 'POST' "$base/api/users" @{ roleId = $userRole.id; email = $emailCreate; password = 'User@123456'; fullName = 'QA Created User'; avatarMediaId = $null; status = 0 } $adminHeaders
$userId = $userCreate.body.id
Add-Result 'users.create' $userCreate.status $userCreate.ok "id=$userId"

if ($userCreate.ok) {
    $userGet = Invoke-Json 'GET' "$base/api/users/$userId" $null $adminHeaders
    Add-Result 'users.getById' $userGet.status $userGet.ok 'fetched user'

    $userList = Invoke-Json 'GET' "$base/api/users?page=1&pageSize=20" $null $adminHeaders
    Add-Result 'users.list' $userList.status $userList.ok "total=$($userList.body.total)"

    $userUpdate = Invoke-Json 'PUT' "$base/api/users/$userId" @{ roleId = $userRole.id; email = $emailCreate; fullName = 'QA Created User Updated'; avatarMediaId = $null; status = 0 } $adminHeaders
    Add-Result 'users.update' $userUpdate.status $userUpdate.ok 'updated user'

    $userStatus = Invoke-Json 'PATCH' "$base/api/users/$userId/status" @{ status = 2 } $adminHeaders
    Add-Result 'users.changeStatus' $userStatus.status $userStatus.ok 'status changed'

    $userDelete = Invoke-Json 'DELETE' "$base/api/users/$userId" $null $adminHeaders
    Add-Result 'users.softDelete' $userDelete.status ($userDelete.status -eq 204) 'soft delete returns 204'
}
else {
    Add-Result 'users.getById' 0 $false ($userCreate.body | ConvertTo-Json -Compress)
    Add-Result 'users.list' 0 $false 'skipped due create failure'
    Add-Result 'users.update' 0 $false 'skipped due create failure'
    Add-Result 'users.changeStatus' 0 $false 'skipped due create failure'
    Add-Result 'users.softDelete' 0 $false 'skipped due create failure'
}

$regEmail = "qa.reg.$([Guid]::NewGuid().ToString('N').Substring(0,6))@mail.test"
$register = Invoke-Json 'POST' "$base/api/users/register" @{ email = $regEmail; password = 'User@123456'; fullName = 'QA Register User' } @{}
$regUserId = $register.body.id
Add-Result 'users.register' $register.status $register.ok "id=$regUserId"

$loginUser = Invoke-Json 'POST' "$base/api/users/login" @{ email = $regEmail; password = 'User@123456' } @{}
$usrToken = $loginUser.body.accessToken
$userHeaders = @{ Authorization = "Bearer $usrToken" }
Add-Result 'users.login' $loginUser.status $loginUser.ok 'user token issued'

$changePass = Invoke-Json 'POST' "$base/api/users/$regUserId/change-password" @{ currentPassword = 'User@123456'; newPassword = 'User@1234567' } $userHeaders
Add-Result 'users.changePassword' $changePass.status $changePass.ok 'changed password'

$verifyEmail = Invoke-Json 'POST' "$base/api/users/verify-email" @{ userId = $regUserId } $userHeaders
Add-Result 'users.verifyEmail' $verifyEmail.status $verifyEmail.ok 'verified email'

$updateAvatar = Invoke-Json 'PATCH' "$base/api/users/$regUserId/avatar" @{ avatarMediaId = 1 } $userHeaders
Add-Result 'users.updateAvatar' $updateAvatar.status $updateAvatar.ok 'updated avatar'

# 3) auth_accounts
$linkAuth = Invoke-Json 'POST' "$base/api/auth_accounts/link" @{ userId = $regUserId; provider = 1; providerUserId = ('google_' + [Guid]::NewGuid().ToString('N').Substring(0, 8)); providerEmail = $regEmail } $adminHeaders
Add-Result 'auth_accounts.link' $linkAuth.status $linkAuth.ok 'linked provider'

$getLinked = Invoke-Json 'GET' "$base/api/auth_accounts/user/$regUserId" $null $adminHeaders
$countLinked = if ($getLinked.ok -and $getLinked.body) { ($getLinked.body | Measure-Object).Count } else { 0 }
Add-Result 'auth_accounts.getByUser' $getLinked.status $getLinked.ok "count=$countLinked"

$unlink = Invoke-Json 'DELETE' "$base/api/auth_accounts/user/$regUserId/provider/1" $null $adminHeaders
Add-Result 'auth_accounts.unlink' $unlink.status ($unlink.status -eq 204) 'unlink returns 204'

# 4) user_profiles
$createProfile = Invoke-Json 'POST' "$base/api/user_profiles" @{ userId = $regUserId; phone = '0901111222'; dateOfBirth = '2000-01-01'; gender = 'male'; bio = 'qa profile'; timezone = 'Asia/Ho_Chi_Minh'; preferredSignVariant = 'vsl'; currentStreakDays = 1; totalXp = 10 } $adminHeaders
Add-Result 'user_profiles.create' $createProfile.status $createProfile.ok 'created'

$updateProfile = Invoke-Json 'PUT' "$base/api/user_profiles/$regUserId" @{ phone = '0903333444'; dateOfBirth = '2000-01-01'; gender = 'male'; bio = 'qa profile updated'; timezone = 'Asia/Ho_Chi_Minh'; preferredSignVariant = 'vsl'; currentStreakDays = 2; totalXp = 20 } $adminHeaders
Add-Result 'user_profiles.update' $updateProfile.status $updateProfile.ok 'updated'

$getProfile = Invoke-Json 'GET' "$base/api/user_profiles/$regUserId" $null $adminHeaders
Add-Result 'user_profiles.get' $getProfile.status $getProfile.ok 'fetched'

# 5) user_settings
$updateSettings = Invoke-Json 'PUT' "$base/api/user_settings/$regUserId" @{ notificationsEnabled = $true; marketingEmailsEnabled = $false; translationAutoSpeak = $true; playbackSpeed = 1.25; dailyGoalMinutes = 30; theme = 'light' } $adminHeaders
Add-Result 'user_settings.update' $updateSettings.status $updateSettings.ok 'updated'

$getSettings = Invoke-Json 'GET' "$base/api/user_settings/$regUserId" $null $adminHeaders
Add-Result 'user_settings.get' $getSettings.status $getSettings.ok 'fetched'

# 6) media_assets
$createMedia = Invoke-Json 'POST' "$base/api/media_assets" @{ ownerUserId = $regUserId; storageProvider = 's3'; fileName = 'qa-file.jpg'; fileUrl = 'https://cdn.example.com/qa-file.jpg'; mimeType = 'image/jpeg'; mediaType = 'image'; fileSizeBytes = 12345; durationSeconds = $null; width = 800; height = 600; status = 2 } $adminHeaders
$mediaId = $createMedia.body.id
Add-Result 'media_assets.create' $createMedia.status $createMedia.ok "id=$mediaId"

if ($createMedia.ok) {
    $getMedia = Invoke-Json 'GET' "$base/api/media_assets/$mediaId" $null $adminHeaders
    Add-Result 'media_assets.getById' $getMedia.status $getMedia.ok 'fetched'

    $listMedia = Invoke-Json 'GET' "$base/api/media_assets?page=1&pageSize=20" $null $adminHeaders
    Add-Result 'media_assets.list' $listMedia.status $listMedia.ok "total=$($listMedia.body.total)"

    $updateMedia = Invoke-Json 'PUT' "$base/api/media_assets/$mediaId" @{ storageProvider = 's3'; fileName = 'qa-file-updated.jpg'; fileUrl = 'https://cdn.example.com/qa-file-updated.jpg'; mimeType = 'image/jpeg'; mediaType = 'image'; fileSizeBytes = 23456; durationSeconds = $null; width = 1024; height = 768; status = 2 } $adminHeaders
    Add-Result 'media_assets.update' $updateMedia.status $updateMedia.ok 'updated'

    $archiveMedia = Invoke-Json 'DELETE' "$base/api/media_assets/$mediaId" $null $adminHeaders
    Add-Result 'media_assets.archive' $archiveMedia.status $archiveMedia.ok 'archive endpoint'
}
else {
    Add-Result 'media_assets.getById' 0 $false ($createMedia.body | ConvertTo-Json -Compress)
    Add-Result 'media_assets.list' 0 $false 'skipped due create failure'
    Add-Result 'media_assets.update' 0 $false 'skipped due create failure'
    Add-Result 'media_assets.archive' 0 $false 'skipped due create failure'
}

$results | Sort-Object Api | Format-Table -AutoSize

$failed = $results | Where-Object { -not $_.Pass }
"FAILED_COUNT=$($failed.Count)"
if ($failed.Count -gt 0) {
    $failed | Sort-Object Api | ConvertTo-Json -Depth 6
}

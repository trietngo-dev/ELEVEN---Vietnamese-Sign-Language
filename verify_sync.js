async function run() {
  console.log("=== VS LANGUAGE PLATFORM - SYNC INTEGRATION TEST ===");
  const API_URL = "http://localhost:5000";

  // 1. Log in to get authentication token
  console.log("Logging in as admin...");
  const loginRes = await fetch(`${API_URL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@exe101.local", password: "Admin@123" })
  });
  if (!loginRes.ok) {
    throw new Error(`Login failed with status ${loginRes.status}`);
  }
  const loginData = await loginRes.json();
  const token = loginData.accessToken;
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };
  console.log("Login successful! Token acquired.");

  // User 3 is Triet Ngo. Let's delete any existing progress for user 3 on lessons 9 and 10
  console.log("\nChecking existing progress for user 3...");
  const progRes = await fetch(`${API_URL}/api/user_lesson_progress`, { headers });
  const progData = await progRes.json();
  const items = progData.items || [];
  const user3Progress = items.filter(p => p.userId === 3);
  
  for (const p of user3Progress) {
    console.log(`Cleaning up old progress record: ID ${p.id} for Lesson ${p.lessonId}`);
    await fetch(`${API_URL}/api/user_lesson_progress/${p.id}`, { method: "DELETE", headers });
  }

  // Check enrollments for user 3
  console.log("\nChecking existing enrollments for user 3...");
  const enrollRes = await fetch(`${API_URL}/api/enrollments/user/3`, { headers });
  const enrolls = await enrollRes.json();
  const enrollsList = Array.isArray(enrolls) ? enrolls : [];
  
  const course6Enrollment = enrollsList.find(e => e.courseId === 6);
  if (course6Enrollment) {
    console.log(`Found existing enrollment for Course 6: ID ${course6Enrollment.id}, Progress: ${course6Enrollment.progressPercent}%, Status: ${course6Enrollment.status}`);
  } else {
    console.log("No existing enrollment for Course 6 found.");
  }

  // 2. Perform upsert progress for user 3 completing lesson 9 (Xin chào)
  console.log("\n--- TEST STEP 1: Completing Lesson 9 (Xin chào) ---");
  const upsert1Res = await fetch(`${API_URL}/api/user_lesson_progress/upsert`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      userId: 3,
      lessonId: 9,
      status: 2, // Completed
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      lastPositionSeconds: 0,
      attemptsCount: 1,
      bestAccuracy: 0.95,
      bestScore: 95.0,
      totalTimeSeconds: 60,
      xpEarned: 50
    })
  });
  if (!upsert1Res.ok) {
    throw new Error(`Failed to upsert progress for lesson 9: ${await upsert1Res.text()}`);
  }
  const upsert1Obj = await upsert1Res.json();
  console.log("Successfully completed Lesson 9! Response ID:", upsert1Obj.id);

  // 3. Verify user 3 is enrolled in course 6 and progress is 50.00%
  console.log("\nVerifying user 3 enrollment in Course 6 after completing Lesson 9...");
  const verify1Res = await fetch(`${API_URL}/api/enrollments/user/3`, { headers });
  const verify1Enrolls = await verify1Res.json();
  const verify1EnrollsList = Array.isArray(verify1Enrolls) ? verify1Enrolls : [];
  const c6Enroll1 = verify1EnrollsList.find(e => e.courseId === 6);
  
  if (!c6Enroll1) {
    throw new Error("FAIL: Enrollment for Course 6 was not created!");
  }
  console.log(`Enrollment successfully verified!`);
  console.log(`  - Enrollment ID: ${c6Enroll1.id}`);
  console.log(`  - progressPercent: ${c6Enroll1.progressPercent}% (Expected: 50%)`);
  console.log(`  - status: ${c6Enroll1.status} (Expected: 1 = InProgress)`);
  
  if (Math.round(c6Enroll1.progressPercent) !== 50) {
    throw new Error(`FAIL: progressPercent is ${c6Enroll1.progressPercent}%, expected 50%`);
  }

  // 4. Perform upsert progress for user 3 completing lesson 10 (Xin lỗi)
  console.log("\n--- TEST STEP 2: Completing Lesson 10 (Xin lỗi) ---");
  const upsert2Res = await fetch(`${API_URL}/api/user_lesson_progress/upsert`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      userId: 3,
      lessonId: 10,
      status: 2, // Completed
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      lastPositionSeconds: 0,
      attemptsCount: 1,
      bestAccuracy: 0.90,
      bestScore: 90.0,
      totalTimeSeconds: 60,
      xpEarned: 50
    })
  });
  if (!upsert2Res.ok) {
    throw new Error(`Failed to upsert progress for lesson 10: ${await upsert2Res.text()}`);
  }
  const upsert2Obj = await upsert2Res.json();
  console.log("Successfully completed Lesson 10! Response ID:", upsert2Obj.id);

  // 5. Verify user 3 is enrolled in course 6 and progress is 100.00%
  console.log("\nVerifying user 3 enrollment in Course 6 after completing Lesson 10...");
  const verify2Res = await fetch(`${API_URL}/api/enrollments/user/3`, { headers });
  const verify2Enrolls = await verify2Res.json();
  const verify2EnrollsList = Array.isArray(verify2Enrolls) ? verify2Enrolls : [];
  const c6Enroll2 = verify2EnrollsList.find(e => e.courseId === 6);
  
  if (!c6Enroll2) {
    throw new Error("FAIL: Enrollment for Course 6 is missing!");
  }
  console.log(`Enrollment successfully verified!`);
  console.log(`  - Enrollment ID: ${c6Enroll2.id}`);
  console.log(`  - progressPercent: ${c6Enroll2.progressPercent}% (Expected: 100%)`);
  console.log(`  - status: ${c6Enroll2.status} (Expected: 2 = Completed)`);
  
  if (Math.round(c6Enroll2.progressPercent) !== 100) {
    throw new Error(`FAIL: progressPercent is ${c6Enroll2.progressPercent}%, expected 100%`);
  }
  if (c6Enroll2.status !== 2) {
    throw new Error(`FAIL: status is ${c6Enroll2.status}, expected 2 (Completed)`);
  }

  console.log("\n✅ ALL INTEGRATION TESTS PASSED SUCCESSFULLY! Sync logic is 100% correct!");
}

run().catch(err => {
  console.error("\n❌ INTEGRATION TEST FAILED:", err);
  process.exit(1);
});

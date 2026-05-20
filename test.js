// node 22 fetch
async function run() {
  const loginRes = await fetch('http://localhost:5000/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@exe101.local', password: 'Admin@123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token || loginData.accessToken;
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  // 1. Cat
  const catRes = await fetch('http://localhost:5000/api/course_categories', {
    method: 'POST', headers, body: JSON.stringify({ name: "Cat " + Date.now(), slug: "cat-" + Date.now(), description: "" })
  });
  const catObj = await catRes.json();

  // 2. Course
  const courseRes = await fetch('http://localhost:5000/api/courses', {
    method: 'POST', headers, body: JSON.stringify({ categoryId: catObj.id, title: "Course " + Date.now(), slug: "course-" + Date.now(), level: "Cơ bản", isPremium: false, createdBy: 1 })
  });
  const courseObj = await courseRes.json();

  // 3. Module
  const modRes = await fetch('http://localhost:5000/api/course_modules', {
    method: 'POST', headers, body: JSON.stringify({ courseId: courseObj.id, title: "Module " + Date.now(), sortOrder: 1, isPreview: false })
  });
  const modObj = await modRes.json();

  // 4. Lesson
  const lesRes = await fetch('http://localhost:5000/api/lessons', {
    method: 'POST', headers, body: JSON.stringify({ courseId: courseObj.id, moduleId: modObj.id, title: "Lesson " + Date.now(), slug: "lesson-" + Date.now(), lessonType: "Video", difficultyLevel: "Beginner", estimatedMinutes: 10, xpReward: 50, sortOrder: 1 })
  });
  const lesObj = await lesRes.json();
  console.log('Created Lesson:', lesObj);

  // Skip step 5 real upload, just reuse mediaAsset ID 5
  // 6. Assign
  const assignRes = await fetch(`http://localhost:5000/api/lessons/${lesObj.id}/video`, {
    method: 'PATCH', headers, body: JSON.stringify({ videoMediaId: 5 })
  });
  const assignObj = await assignRes.json();
  console.log('Assign Result:', assignObj);

  // Verify
  const verifyRes = await fetch(`http://localhost:5000/api/lessons/${lesObj.id}`, { headers });
  const verifyObj = await verifyRes.json();
  console.log('Verified Lesson videoMediaId:', verifyObj.videoMediaId);
}

run();

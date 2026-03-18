Act as a senior .NET backend architect and generate a production-style ASP.NET Core Web API project for the “Eleven” platform based on the database schema I provide.

## Main goal
Build a clean, scalable, maintainable backend in **.NET 8 Web API** using **Clean Architecture**, **CQRS**, **MediatR**, **FluentValidation**, **Entity Framework Core**, **JWT Authentication**, **Role-based Authorization**, **Swagger**, and clean response/error handling.

The solution must follow this exact 4-layer architecture:

src/
  E-Commerce.Application
    /Behaviors
    /Common
    /Interfaces
    /Models
    /Services
    /UseCases
    ApplicationAssemblyMarker.cs

  E-Commerce.Domain
    /Entities
    /Enums
    /Interfaces
    /ValueObjects

  E-Commerce.Infrastructure
    /Configurations
    /Identity
    /Jobs
    /Migrations
    /Repositories
    /Security
    /Seed
    /Services

  E-Commerce.Presentation
    /Controllers
    /Extensions
    /Hubs

> Keep the project names if already created, but the business domain is not e-commerce. The actual business is **Eleven - Vietnamese Sign Language Learning Platform**. So all code, namespaces, comments, entities, DTOs, endpoints, and business logic must match the Eleven platform, not shopping/e-commerce logic.

---

## Business context
This system is a platform for learning Vietnamese sign language, practicing lessons, managing vocabulary, using AI sign translation, tracking progress, sending feedback, and managing subscriptions.

The backend must support these main modules:

1. Authentication and user management
2. User profile and settings
3. Course catalog, modules, lessons
4. Dictionary / vocabulary library
5. Learning progress tracking
6. AI translation sessions and translation results
7. AI practice sessions and attempts
8. Feedback from users and admin feedback handling
9. Subscription plans and payments
10. Admin management APIs
11. Notifications
12. Dashboard summary APIs for user and admin

---

## Technical requirements

### Framework and libraries
Use:
- .NET 8
- ASP.NET Core Web API
- Entity Framework Core
- MediatR
- FluentValidation
- JWT Bearer Authentication
- Swagger / OpenAPI
- Serilog
- SignalR for real-time events if needed
- AutoMapper or Mapster for mapping
- SQL Server provider for EF Core unless otherwise needed
- Clean Architecture with clear dependency direction:
  - Presentation -> Application
  - Infrastructure -> Application + Domain
  - Domain -> no dependency on other layers

### Coding standards
- Use **async/await** everywhere appropriate
- Use **CancellationToken** in handlers and services
- Use **DTOs** for request/response, never expose EF entities directly
- Use **Result pattern** or standardized **ApiResponse<T>**
- Add **global exception middleware**
- Add **validation pipeline behavior**
- Add **logging behavior**
- Add **pagination support**
- Add **soft delete only if truly needed**, otherwise normal active/inactive status
- Use **IEntityTypeConfiguration<T>** for EF configurations
- Use **repository + unit of work only where useful**, avoid unnecessary abstraction
- Keep code readable and consistent
- All files must compile correctly
- Avoid placeholder pseudo-code unless clearly marked as TODO
- Generate realistic business logic, not empty CRUD only

---

## Domain and naming rules
Use singular class names and PascalCase:
- User
- Role
- AuthAccount
- UserProfile
- UserSetting
- Notification
- Badge
- UserBadge
- SubscriptionPlan
- UserSubscription
- PaymentTransaction
- MediaAsset
- CourseCategory
- Course
- CourseModule
- Lesson
- LessonPrerequisite
- VocabularyCategory
- Vocabulary
- VocabularyMedia
- VocabularyRelation
- LessonVocabulary
- Enrollment
- UserLessonProgress
- LessonAttempt
- UserVocabularyProgress
- TranslationSession
- TranslationSegment
- PracticeSession
- PracticeAttempt
- FeedbackCategory
- Feedback
- UserActivityLog
- AdminActionLog

Important:
- Even if DB table names are plural, entity names must be singular
- Configure table names explicitly in EF Core mapping
- Keep the logic aligned to the sign language learning platform

---

## Database schema to implement
Generate entities, configurations, repositories, and DbContext based on this business model:

### Auth & User
- Roles
- Users
- UserRoles
- AuthAccounts
- UserProfiles
- Languages
- UserSettings
- Notifications
- Badges
- UserBadges

### Billing
- SubscriptionPlans
- UserSubscriptions
- PaymentTransactions

### Media
- MediaAssets

### Learning Content
- CourseCategories
- Courses
- CourseModules
- Lessons
- LessonPrerequisites
- VocabularyCategories
- Vocabularies
- VocabularyMedia
- VocabularyRelations
- LessonVocabularies

### Learning Progress
- Enrollments
- UserLessonProgress
- LessonAttempts
- UserVocabularyProgress

### AI & Translation
- TranslationSessions
- TranslationSegments
- PracticeSessions
- PracticeAttempts

### Feedback & Audit
- FeedbackCategories
- Feedbacks
- UserActivityLogs
- AdminActionLogs

Implement all key properties, relationships, enums, constraints, and indexes based on the schema I designed.

---

## Required enums
Create enums in Domain/Enums for:
- UserStatus
- AuthProvider
- ContentStatus
- EnrollmentStatus
- ProgressStatus
- SessionStatus
- SubscriptionStatus
- PaymentStatus
- MediaStatus
- FeedbackStatus
- BadgeType
- RelationType

---

## Required Application structure
Inside `E-Commerce.Application`, organize by feature/use-case.

Suggested folder structure:
- UseCases/Auth
- UseCases/Users
- UseCases/Profile
- UseCases/Courses
- UseCases/Lessons
- UseCases/Vocabularies
- UseCases/Progress
- UseCases/Translation
- UseCases/Practice
- UseCases/Feedback
- UseCases/Subscriptions
- UseCases/Admin
- UseCases/Notifications
- UseCases/Dashboard

For each feature:
- Commands
- Queries
- Validators
- DTOs
- Handlers

Examples:
- RegisterUserCommand
- LoginCommand
- GetMyProfileQuery
- UpdateProfileCommand
- GetCoursesQuery
- GetCourseDetailQuery
- EnrollCourseCommand
- GetLessonDetailQuery
- CompleteLessonCommand
- GetVocabularyLibraryQuery
- SaveVocabularyCommand
- StartTranslationSessionCommand
- AddTranslationSegmentCommand
- CompleteTranslationSessionCommand
- StartPracticeSessionCommand
- SubmitPracticeAttemptCommand
- CompletePracticeSessionCommand
- CreateFeedbackCommand
- ReplyFeedbackCommand
- GetSubscriptionPlansQuery
- CreateSubscriptionCommand
- GetUserDashboardQuery
- GetAdminDashboardQuery

---

## Required Infrastructure structure
Inside `E-Commerce.Infrastructure`, generate:
- ApplicationDbContext
- EF Core configurations for all entities
- Repository implementations
- JWT token service
- Current user service
- Password hashing service
- Date time provider
- File/media service abstraction
- Fake payment service for demo
- Seed data
- Migrations-ready setup

Under Infrastructure/Identity:
- Identity/JWT configuration
- Auth token generation
- Password hashing service

Under Infrastructure/Security:
- JWT options
- Token service
- Authorization helpers

Under Infrastructure/Seed:
Seed demo data for:
- Admin role
- User role
- Default admin account
- Languages (vi, en, vsl)
- Subscription plans (free, pro, premium)
- Sample categories
- Sample courses
- Sample modules
- Sample lessons
- Sample vocabulary entries
- Feedback categories

---

## Required Presentation structure
Inside `E-Commerce.Presentation`, create:
- Controllers
- Extensions
- Hubs if useful

Create controllers:
- AuthController
- UsersController
- ProfileController
- CoursesController
- LessonsController
- VocabularyController
- TranslationController
- PracticeController
- FeedbackController
- SubscriptionController
- NotificationController
- DashboardController
- AdminController

Requirements:
- Use RESTful routes
- Use `[Authorize]` where needed
- Use `[Authorize(Roles = "Admin")]` for admin APIs
- Return consistent response format
- Use model validation properly
- Add Swagger XML comments if possible

---

## Required APIs

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Profile
- GET /api/profile
- PUT /api/profile
- PUT /api/profile/settings

### Courses
- GET /api/courses
- GET /api/courses/{id}
- POST /api/courses/{id}/enroll
- GET /api/courses/my-learning
- GET /api/courses/completed

### Lessons
- GET /api/lessons/{id}
- POST /api/lessons/{id}/start
- POST /api/lessons/{id}/complete
- GET /api/lessons/{id}/progress

### Vocabulary / Dictionary
- GET /api/vocabulary
- GET /api/vocabulary/{id}
- GET /api/vocabulary/categories
- GET /api/vocabulary/learned
- POST /api/vocabulary/{id}/save
- DELETE /api/vocabulary/{id}/save

### AI Translation
- POST /api/translation/sessions/start
- POST /api/translation/sessions/{id}/segments
- POST /api/translation/sessions/{id}/complete
- GET /api/translation/history

### AI Practice
- POST /api/practice/sessions/start
- POST /api/practice/sessions/{id}/attempts
- POST /api/practice/sessions/{id}/complete
- GET /api/practice/history

### Feedback
- POST /api/feedback
- GET /api/feedback/my
- GET /api/admin/feedback
- GET /api/admin/feedback/{id}
- POST /api/admin/feedback/{id}/reply
- PUT /api/admin/feedback/{id}/status

### Subscription
- GET /api/subscriptions/plans
- GET /api/subscriptions/current
- POST /api/subscriptions/upgrade
- GET /api/payments/history

### Notifications
- GET /api/notifications
- PUT /api/notifications/{id}/read

### Dashboard
- GET /api/dashboard/me
- GET /api/admin/dashboard

---

## Business rules to implement

### Auth
- Email must be unique
- Password must be hashed
- Admin and User roles must be supported
- JWT token must include user id, email, and roles

### Courses and learning
- A user can enroll in a course only once
- Course progress is derived from lesson progress
- Completing lessons should update:
  - user lesson progress
  - enrollment progress percent
  - user profile XP if needed
- Course completion should be calculated when all required lessons are completed

### Vocabulary
- User can save vocabulary
- User vocabulary progress tracks practice count, mastery level, and learned status
- Vocabulary search and filtering by category/keyword must work

### Translation session
- Start session creates TranslationSession with status Running
- Add segment stores recognized text, confidence, timestamps, optional matched vocabulary
- Complete session updates final text, average confidence, ended time, status Completed
- For now, AI recognition can be mocked through service interface; keep the architecture ready to replace with ONNX later

### Practice session
- Start practice session with lesson or vocabulary context
- Submit practice attempt with expected vs recognized vocabulary/text
- Accuracy and correct count must be calculated properly
- Complete session stores final accuracy and status

### Feedback
- User creates feedback with category, rating, content
- Admin can review and reply
- Feedback status flow: New -> Viewed -> Responded -> Archived

### Subscription
- Plans include free / pro / premium
- Current subscription must be queryable
- Upgrade creates subscription and payment record
- Payment provider can be mocked for demo

### Dashboard
User dashboard should include:
- total completed lessons
- learned vocabulary count
- streak info
- recent courses
- recent translations
- recommended courses/vocabulary if possible

Admin dashboard should include:
- total users
- total feedback
- unresolved feedback count
- total courses
- active subscriptions
- recent activity summary

---

## Cross-cutting concerns
Implement:
- `ValidationBehavior<TRequest, TResponse>`
- `LoggingBehavior<TRequest, TResponse>`
- `UnhandledExceptionMiddleware`
- `ApiResponse<T>`
- `PagedResult<T>`
- `BaseEntity` if useful
- `ICurrentUserService`
- `IDateTimeProvider`
- `IJwtTokenService`
- `IPasswordHasher`
- `IApplicationDbContext`

---

## EF Core requirements
- Use Fluent API configurations for all entities
- Configure relationships explicitly
- Configure indexes explicitly
- Configure enum conversions if needed
- Add DbSet for all entities
- Add seed support
- Make migration-ready code

---

## Output format requirement
Generate the code step by step in a practical order.

### Step 1
Create the solution structure and all project references correctly.

### Step 2
Create Domain layer:
- entities
- enums
- interfaces
- value objects if needed

### Step 3
Create Application layer:
- abstractions
- DTOs
- behaviors
- use cases
- validators

### Step 4
Create Infrastructure layer:
- DbContext
- configurations
- repositories
- security
- token service
- seed
- services

### Step 5
Create Presentation layer:
- controllers
- DI registration
- middleware
- swagger
- auth setup

### Step 6
Generate sample migration and seed data

### Step 7
Generate example requests/responses for Swagger testing

Important:
- Whenever generating a file, provide the full file content
- Do not skip important files
- Do not generate fake incomplete code
- Keep everything compilable
- If a feature is large, generate it feature-by-feature but keep consistency
- Prefer correct architecture over overly clever shortcuts

---

## Additional requirement for AI integration
The project must be designed so that later I can plug in:
- ONNX model for sign recognition
- JSON label mapping
- text-to-speech service

So define clean interfaces such as:
- ISignRecognitionService
- ITextToSpeechService
- ITranslationProcessingService

For now, implement mock/demo versions in Infrastructure/Services.

---

## Final expectation
I want a clean, beautiful, professional backend template that matches the Eleven sign language learning platform, follows .NET clean architecture, compiles correctly, uses proper naming, has correct business logic, and is ready for future expansion.

Now start with:
1. solution structure
2. project references
3. core Domain entities and enums



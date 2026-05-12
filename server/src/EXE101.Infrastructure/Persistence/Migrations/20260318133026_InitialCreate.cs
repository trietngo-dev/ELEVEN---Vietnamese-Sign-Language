using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EXE101.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "feedback_categories",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_feedback_categories", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "roles",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_roles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "subscription_plans",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    billing_cycle = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    price_vnd = table.Column<long>(type: "bigint", nullable: false),
                    daily_translation_limit = table.Column<int>(type: "integer", nullable: false),
                    ai_practice_limit = table.Column<int>(type: "integer", nullable: false),
                    course_access_scope = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    can_save_history = table.Column<bool>(type: "boolean", nullable: false),
                    certificate_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    priority_support = table.Column<bool>(type: "boolean", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_subscription_plans", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "vocabulary_categories",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    slug = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_vocabulary_categories", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    role_id = table.Column<long>(type: "bigint", nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    password_hash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    full_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    avatar_media_id = table.Column<long>(type: "bigint", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    email_verified_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    last_login_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_users", x => x.id);
                    table.ForeignKey(
                        name: "fk_users_roles_role_id",
                        column: x => x.role_id,
                        principalTable: "roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "admin_action_logs",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    admin_user_id = table.Column<long>(type: "bigint", nullable: false),
                    action_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    entity_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    entity_id = table.Column<long>(type: "bigint", nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_admin_action_logs", x => x.id);
                    table.ForeignKey(
                        name: "fk_admin_action_logs_users_admin_user_id",
                        column: x => x.admin_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "auth_accounts",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    provider = table.Column<string>(type: "text", nullable: false),
                    provider_user_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    provider_email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_auth_accounts", x => x.id);
                    table.ForeignKey(
                        name: "fk_auth_accounts_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "feedbacks",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    category_id = table.Column<long>(type: "bigint", nullable: false),
                    rating = table.Column<int>(type: "integer", nullable: false),
                    subject = table.Column<string>(type: "text", nullable: true),
                    content = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    admin_reply = table.Column<string>(type: "text", nullable: true),
                    responded_by = table.Column<long>(type: "bigint", nullable: true),
                    responded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_feedbacks", x => x.id);
                    table.ForeignKey(
                        name: "fk_feedbacks_feedback_categories_category_id",
                        column: x => x.category_id,
                        principalTable: "feedback_categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_feedbacks_users_responded_by",
                        column: x => x.responded_by,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_feedbacks_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "media_assets",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    owner_user_id = table.Column<long>(type: "bigint", nullable: true),
                    storage_provider = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    file_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    file_url = table.Column<string>(type: "text", nullable: false),
                    mime_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    media_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    file_size_bytes = table.Column<long>(type: "bigint", nullable: false),
                    duration_seconds = table.Column<int>(type: "integer", nullable: true),
                    width = table.Column<int>(type: "integer", nullable: true),
                    height = table.Column<int>(type: "integer", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_media_assets", x => x.id);
                    table.ForeignKey(
                        name: "fk_media_assets_users_owner_user_id",
                        column: x => x.owner_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "notifications",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    message = table.Column<string>(type: "text", nullable: false),
                    type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    is_read = table.Column<bool>(type: "boolean", nullable: false),
                    action_url = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    read_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_notifications", x => x.id);
                    table.ForeignKey(
                        name: "fk_notifications_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_activity_logs",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    action_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    entity_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    entity_id = table.Column<long>(type: "bigint", nullable: true),
                    metadata_json = table.Column<string>(type: "jsonb", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_activity_logs", x => x.id);
                    table.ForeignKey(
                        name: "fk_user_activity_logs_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_profiles",
                columns: table => new
                {
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    date_of_birth = table.Column<DateOnly>(type: "date", nullable: true),
                    gender = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    bio = table.Column<string>(type: "text", nullable: true),
                    timezone = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    preferred_sign_variant = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    current_streak_days = table.Column<int>(type: "integer", nullable: false),
                    total_xp = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_profiles", x => x.user_id);
                    table.ForeignKey(
                        name: "fk_user_profiles_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_settings",
                columns: table => new
                {
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    notifications_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    marketing_emails_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    translation_auto_speak = table.Column<bool>(type: "boolean", nullable: false),
                    playback_speed = table.Column<decimal>(type: "numeric(4,2)", precision: 4, scale: 2, nullable: false),
                    daily_goal_minutes = table.Column<int>(type: "integer", nullable: false),
                    theme = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_settings", x => x.user_id);
                    table.ForeignKey(
                        name: "fk_user_settings_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_subscriptions",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    plan_id = table.Column<long>(type: "bigint", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    start_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    auto_renew = table.Column<bool>(type: "boolean", nullable: false),
                    source = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_subscriptions", x => x.id);
                    table.ForeignKey(
                        name: "fk_user_subscriptions_subscription_plans_plan_id",
                        column: x => x.plan_id,
                        principalTable: "subscription_plans",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_user_subscriptions_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "vocabularies",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    category_id = table.Column<long>(type: "bigint", nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    term_vi = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    normalized_term = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    usage_example = table.Column<string>(type: "text", nullable: true),
                    difficulty_level = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    hand_hint_text = table.Column<string>(type: "text", nullable: true),
                    is_featured = table.Column<bool>(type: "boolean", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    created_by = table.Column<long>(type: "bigint", nullable: false),
                    published_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_vocabularies", x => x.id);
                    table.ForeignKey(
                        name: "fk_vocabularies_users_created_by",
                        column: x => x.created_by,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_vocabularies_vocabulary_categories_category_id",
                        column: x => x.category_id,
                        principalTable: "vocabulary_categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "badges",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    badge_type = table.Column<string>(type: "text", nullable: false),
                    icon_media_id = table.Column<long>(type: "bigint", nullable: true),
                    criteria_json = table.Column<string>(type: "jsonb", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_badges", x => x.id);
                    table.ForeignKey(
                        name: "fk_badges_media_assets_icon_media_id",
                        column: x => x.icon_media_id,
                        principalTable: "media_assets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "course_categories",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    slug = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    color_hex = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    icon_media_id = table.Column<long>(type: "bigint", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_course_categories", x => x.id);
                    table.ForeignKey(
                        name: "fk_course_categories_media_assets_icon_media_id",
                        column: x => x.icon_media_id,
                        principalTable: "media_assets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "translation_sessions",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<long>(type: "bigint", nullable: true),
                    input_mode = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    output_mode = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    sign_variant_used = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    final_text = table.Column<string>(type: "text", nullable: true),
                    final_audio_media_id = table.Column<long>(type: "bigint", nullable: true),
                    average_confidence = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ended_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_translation_sessions", x => x.id);
                    table.ForeignKey(
                        name: "fk_translation_sessions_media_assets_final_audio_media_id",
                        column: x => x.final_audio_media_id,
                        principalTable: "media_assets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_translation_sessions_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "payment_transactions",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    user_subscription_id = table.Column<long>(type: "bigint", nullable: true),
                    amount_vnd = table.Column<long>(type: "bigint", nullable: false),
                    currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    payment_method = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    payment_provider = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    provider_transaction_ref = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    paid_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_payment_transactions", x => x.id);
                    table.ForeignKey(
                        name: "fk_payment_transactions_user_subscriptions_user_subscription_id",
                        column: x => x.user_subscription_id,
                        principalTable: "user_subscriptions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_payment_transactions_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_vocabulary_progress",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    vocabulary_id = table.Column<long>(type: "bigint", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    first_learned_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    last_practiced_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    mastery_level = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    total_practice_count = table.Column<int>(type: "integer", nullable: false),
                    correct_count = table.Column<int>(type: "integer", nullable: false),
                    best_confidence = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    is_saved = table.Column<bool>(type: "boolean", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_vocabulary_progress", x => x.id);
                    table.ForeignKey(
                        name: "fk_user_vocabulary_progress_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_user_vocabulary_progress_vocabularies_vocabulary_id",
                        column: x => x.vocabulary_id,
                        principalTable: "vocabularies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "vocabulary_media",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    vocabulary_id = table.Column<long>(type: "bigint", nullable: false),
                    media_id = table.Column<long>(type: "bigint", nullable: false),
                    usage_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    is_primary = table.Column<bool>(type: "boolean", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_vocabulary_media", x => x.id);
                    table.ForeignKey(
                        name: "fk_vocabulary_media_media_assets_media_id",
                        column: x => x.media_id,
                        principalTable: "media_assets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_vocabulary_media_vocabularies_vocabulary_id",
                        column: x => x.vocabulary_id,
                        principalTable: "vocabularies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_badges",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    badge_id = table.Column<long>(type: "bigint", nullable: false),
                    awarded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_badges", x => x.id);
                    table.ForeignKey(
                        name: "fk_user_badges_badges_badge_id",
                        column: x => x.badge_id,
                        principalTable: "badges",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_user_badges_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "courses",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    category_id = table.Column<long>(type: "bigint", nullable: false),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    slug = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    summary = table.Column<string>(type: "text", nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    level = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    cover_media_id = table.Column<long>(type: "bigint", nullable: true),
                    trailer_media_id = table.Column<long>(type: "bigint", nullable: true),
                    is_premium = table.Column<bool>(type: "boolean", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    published_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_by = table.Column<long>(type: "bigint", nullable: false),
                    updated_by = table.Column<long>(type: "bigint", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_courses", x => x.id);
                    table.ForeignKey(
                        name: "fk_courses_course_categories_category_id",
                        column: x => x.category_id,
                        principalTable: "course_categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_courses_media_assets_cover_media_id",
                        column: x => x.cover_media_id,
                        principalTable: "media_assets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_courses_media_assets_trailer_media_id",
                        column: x => x.trailer_media_id,
                        principalTable: "media_assets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_courses_users_created_by",
                        column: x => x.created_by,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_courses_users_updated_by",
                        column: x => x.updated_by,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "translation_segments",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    session_id = table.Column<long>(type: "bigint", nullable: false),
                    segment_order = table.Column<int>(type: "integer", nullable: false),
                    recognized_text = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    normalized_text = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    confidence = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    matched_vocabulary_id = table.Column<long>(type: "bigint", nullable: true),
                    started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ended_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    audio_media_id = table.Column<long>(type: "bigint", nullable: true),
                    raw_prediction_json = table.Column<string>(type: "jsonb", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_translation_segments", x => x.id);
                    table.ForeignKey(
                        name: "fk_translation_segments_media_assets_audio_media_id",
                        column: x => x.audio_media_id,
                        principalTable: "media_assets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_translation_segments_translation_sessions_session_id",
                        column: x => x.session_id,
                        principalTable: "translation_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_translation_segments_vocabularies_matched_vocabulary_id",
                        column: x => x.matched_vocabulary_id,
                        principalTable: "vocabularies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "course_modules",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    course_id = table.Column<long>(type: "bigint", nullable: false),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    is_preview = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_course_modules", x => x.id);
                    table.ForeignKey(
                        name: "fk_course_modules_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "lessons",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    course_id = table.Column<long>(type: "bigint", nullable: false),
                    module_id = table.Column<long>(type: "bigint", nullable: false),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    slug = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    short_description = table.Column<string>(type: "text", nullable: true),
                    objective_text = table.Column<string>(type: "text", nullable: true),
                    cover_media_id = table.Column<long>(type: "bigint", nullable: true),
                    video_media_id = table.Column<long>(type: "bigint", nullable: true),
                    lesson_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    difficulty_level = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    estimated_minutes = table.Column<int>(type: "integer", nullable: false),
                    xp_reward = table.Column<int>(type: "integer", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    published_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_lessons", x => x.id);
                    table.ForeignKey(
                        name: "fk_lessons_course_modules_module_id",
                        column: x => x.module_id,
                        principalTable: "course_modules",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_lessons_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_lessons_media_assets_cover_media_id",
                        column: x => x.cover_media_id,
                        principalTable: "media_assets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_lessons_media_assets_video_media_id",
                        column: x => x.video_media_id,
                        principalTable: "media_assets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "enrollments",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    course_id = table.Column<long>(type: "bigint", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    enrolled_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    current_module_id = table.Column<long>(type: "bigint", nullable: true),
                    current_lesson_id = table.Column<long>(type: "bigint", nullable: true),
                    progress_percent = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_enrollments", x => x.id);
                    table.ForeignKey(
                        name: "fk_enrollments_course_modules_current_module_id",
                        column: x => x.current_module_id,
                        principalTable: "course_modules",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_enrollments_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_enrollments_lessons_current_lesson_id",
                        column: x => x.current_lesson_id,
                        principalTable: "lessons",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_enrollments_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "lesson_attempts",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    lesson_id = table.Column<long>(type: "bigint", nullable: false),
                    practice_session_id = table.Column<long>(type: "bigint", nullable: true),
                    started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    finished_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    accuracy = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    duration_seconds = table.Column<int>(type: "integer", nullable: false),
                    xp_earned = table.Column<int>(type: "integer", nullable: false),
                    passed = table.Column<bool>(type: "boolean", nullable: false),
                    completion_source = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_lesson_attempts", x => x.id);
                    table.ForeignKey(
                        name: "fk_lesson_attempts_lessons_lesson_id",
                        column: x => x.lesson_id,
                        principalTable: "lessons",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_lesson_attempts_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "lesson_vocabularies",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    lesson_id = table.Column<long>(type: "bigint", nullable: false),
                    vocabulary_id = table.Column<long>(type: "bigint", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    is_required = table.Column<bool>(type: "boolean", nullable: false),
                    expected_accuracy = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_lesson_vocabularies", x => x.id);
                    table.ForeignKey(
                        name: "fk_lesson_vocabularies_lessons_lesson_id",
                        column: x => x.lesson_id,
                        principalTable: "lessons",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_lesson_vocabularies_vocabularies_vocabulary_id",
                        column: x => x.vocabulary_id,
                        principalTable: "vocabularies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "practice_sessions",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    course_id = table.Column<long>(type: "bigint", nullable: true),
                    lesson_id = table.Column<long>(type: "bigint", nullable: true),
                    vocabulary_id = table.Column<long>(type: "bigint", nullable: true),
                    mode = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    prompt_text = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    total_items = table.Column<int>(type: "integer", nullable: false),
                    correct_items = table.Column<int>(type: "integer", nullable: false),
                    accuracy = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ended_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_practice_sessions", x => x.id);
                    table.ForeignKey(
                        name: "fk_practice_sessions_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_practice_sessions_lessons_lesson_id",
                        column: x => x.lesson_id,
                        principalTable: "lessons",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_practice_sessions_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_practice_sessions_vocabularies_vocabulary_id",
                        column: x => x.vocabulary_id,
                        principalTable: "vocabularies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "user_lesson_progress",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    lesson_id = table.Column<long>(type: "bigint", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    last_position_seconds = table.Column<int>(type: "integer", nullable: false),
                    attempts_count = table.Column<int>(type: "integer", nullable: false),
                    best_accuracy = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    best_score = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: false),
                    total_time_seconds = table.Column<int>(type: "integer", nullable: false),
                    xp_earned = table.Column<int>(type: "integer", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_lesson_progress", x => x.id);
                    table.ForeignKey(
                        name: "fk_user_lesson_progress_lessons_lesson_id",
                        column: x => x.lesson_id,
                        principalTable: "lessons",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_user_lesson_progress_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "practice_attempts",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    practice_session_id = table.Column<long>(type: "bigint", nullable: false),
                    expected_vocabulary_id = table.Column<long>(type: "bigint", nullable: false),
                    recognized_vocabulary_id = table.Column<long>(type: "bigint", nullable: true),
                    expected_text = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    recognized_text = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    confidence = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    is_correct = table.Column<bool>(type: "boolean", nullable: false),
                    response_time_ms = table.Column<int>(type: "integer", nullable: true),
                    feedback_text = table.Column<string>(type: "text", nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_practice_attempts", x => x.id);
                    table.ForeignKey(
                        name: "fk_practice_attempts_practice_sessions_practice_session_id",
                        column: x => x.practice_session_id,
                        principalTable: "practice_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_practice_attempts_vocabularies_expected_vocabulary_id",
                        column: x => x.expected_vocabulary_id,
                        principalTable: "vocabularies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_practice_attempts_vocabularies_recognized_vocabulary_id",
                        column: x => x.recognized_vocabulary_id,
                        principalTable: "vocabularies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "ix_admin_action_logs_admin_user_id",
                table: "admin_action_logs",
                column: "admin_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_auth_accounts_provider_provider_user_id",
                table: "auth_accounts",
                columns: new[] { "provider", "provider_user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_auth_accounts_user_id",
                table: "auth_accounts",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_badges_code",
                table: "badges",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_badges_icon_media_id",
                table: "badges",
                column: "icon_media_id");

            migrationBuilder.CreateIndex(
                name: "ix_course_categories_icon_media_id",
                table: "course_categories",
                column: "icon_media_id");

            migrationBuilder.CreateIndex(
                name: "ix_course_categories_slug",
                table: "course_categories",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_course_modules_course_id",
                table: "course_modules",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_courses_category_id",
                table: "courses",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "ix_courses_cover_media_id",
                table: "courses",
                column: "cover_media_id");

            migrationBuilder.CreateIndex(
                name: "ix_courses_created_by",
                table: "courses",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "ix_courses_slug",
                table: "courses",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_courses_trailer_media_id",
                table: "courses",
                column: "trailer_media_id");

            migrationBuilder.CreateIndex(
                name: "ix_courses_updated_by",
                table: "courses",
                column: "updated_by");

            migrationBuilder.CreateIndex(
                name: "ix_enrollments_course_id",
                table: "enrollments",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_enrollments_current_lesson_id",
                table: "enrollments",
                column: "current_lesson_id");

            migrationBuilder.CreateIndex(
                name: "ix_enrollments_current_module_id",
                table: "enrollments",
                column: "current_module_id");

            migrationBuilder.CreateIndex(
                name: "ix_enrollments_user_id_course_id",
                table: "enrollments",
                columns: new[] { "user_id", "course_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_feedback_categories_name",
                table: "feedback_categories",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_feedbacks_category_id",
                table: "feedbacks",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "ix_feedbacks_responded_by",
                table: "feedbacks",
                column: "responded_by");

            migrationBuilder.CreateIndex(
                name: "ix_feedbacks_user_id",
                table: "feedbacks",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_lesson_attempts_lesson_id",
                table: "lesson_attempts",
                column: "lesson_id");

            migrationBuilder.CreateIndex(
                name: "ix_lesson_attempts_user_id",
                table: "lesson_attempts",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_lesson_vocabularies_lesson_id_vocabulary_id",
                table: "lesson_vocabularies",
                columns: new[] { "lesson_id", "vocabulary_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_lesson_vocabularies_vocabulary_id",
                table: "lesson_vocabularies",
                column: "vocabulary_id");

            migrationBuilder.CreateIndex(
                name: "ix_lessons_course_id",
                table: "lessons",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_lessons_cover_media_id",
                table: "lessons",
                column: "cover_media_id");

            migrationBuilder.CreateIndex(
                name: "ix_lessons_module_id",
                table: "lessons",
                column: "module_id");

            migrationBuilder.CreateIndex(
                name: "ix_lessons_slug",
                table: "lessons",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_lessons_video_media_id",
                table: "lessons",
                column: "video_media_id");

            migrationBuilder.CreateIndex(
                name: "ix_media_assets_owner_user_id",
                table: "media_assets",
                column: "owner_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_media_assets_status",
                table: "media_assets",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_notifications_user_id",
                table: "notifications",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_payment_transactions_user_id",
                table: "payment_transactions",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_payment_transactions_user_subscription_id",
                table: "payment_transactions",
                column: "user_subscription_id");

            migrationBuilder.CreateIndex(
                name: "ix_practice_attempts_expected_vocabulary_id",
                table: "practice_attempts",
                column: "expected_vocabulary_id");

            migrationBuilder.CreateIndex(
                name: "ix_practice_attempts_practice_session_id_sort_order",
                table: "practice_attempts",
                columns: new[] { "practice_session_id", "sort_order" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_practice_attempts_recognized_vocabulary_id",
                table: "practice_attempts",
                column: "recognized_vocabulary_id");

            migrationBuilder.CreateIndex(
                name: "ix_practice_sessions_course_id",
                table: "practice_sessions",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_practice_sessions_lesson_id",
                table: "practice_sessions",
                column: "lesson_id");

            migrationBuilder.CreateIndex(
                name: "ix_practice_sessions_user_id",
                table: "practice_sessions",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_practice_sessions_vocabulary_id",
                table: "practice_sessions",
                column: "vocabulary_id");

            migrationBuilder.CreateIndex(
                name: "ix_roles_code",
                table: "roles",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_subscription_plans_code",
                table: "subscription_plans",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_translation_segments_audio_media_id",
                table: "translation_segments",
                column: "audio_media_id");

            migrationBuilder.CreateIndex(
                name: "ix_translation_segments_matched_vocabulary_id",
                table: "translation_segments",
                column: "matched_vocabulary_id");

            migrationBuilder.CreateIndex(
                name: "ix_translation_segments_session_id_segment_order",
                table: "translation_segments",
                columns: new[] { "session_id", "segment_order" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_translation_sessions_final_audio_media_id",
                table: "translation_sessions",
                column: "final_audio_media_id");

            migrationBuilder.CreateIndex(
                name: "ix_translation_sessions_user_id",
                table: "translation_sessions",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_activity_logs_user_id",
                table: "user_activity_logs",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_badges_badge_id",
                table: "user_badges",
                column: "badge_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_badges_user_id_badge_id",
                table: "user_badges",
                columns: new[] { "user_id", "badge_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_user_lesson_progress_lesson_id",
                table: "user_lesson_progress",
                column: "lesson_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_lesson_progress_user_id_lesson_id",
                table: "user_lesson_progress",
                columns: new[] { "user_id", "lesson_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_user_subscriptions_plan_id",
                table: "user_subscriptions",
                column: "plan_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_subscriptions_user_id",
                table: "user_subscriptions",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_vocabulary_progress_user_id_vocabulary_id",
                table: "user_vocabulary_progress",
                columns: new[] { "user_id", "vocabulary_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_user_vocabulary_progress_vocabulary_id",
                table: "user_vocabulary_progress",
                column: "vocabulary_id");

            migrationBuilder.CreateIndex(
                name: "ix_users_email",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_users_role_id",
                table: "users",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "ix_vocabularies_category_id",
                table: "vocabularies",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "ix_vocabularies_created_by",
                table: "vocabularies",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "ix_vocabulary_categories_slug",
                table: "vocabulary_categories",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_vocabulary_media_media_id",
                table: "vocabulary_media",
                column: "media_id");

            migrationBuilder.CreateIndex(
                name: "ix_vocabulary_media_vocabulary_id_media_id",
                table: "vocabulary_media",
                columns: new[] { "vocabulary_id", "media_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "admin_action_logs");

            migrationBuilder.DropTable(
                name: "auth_accounts");

            migrationBuilder.DropTable(
                name: "enrollments");

            migrationBuilder.DropTable(
                name: "feedbacks");

            migrationBuilder.DropTable(
                name: "lesson_attempts");

            migrationBuilder.DropTable(
                name: "lesson_vocabularies");

            migrationBuilder.DropTable(
                name: "notifications");

            migrationBuilder.DropTable(
                name: "payment_transactions");

            migrationBuilder.DropTable(
                name: "practice_attempts");

            migrationBuilder.DropTable(
                name: "translation_segments");

            migrationBuilder.DropTable(
                name: "user_activity_logs");

            migrationBuilder.DropTable(
                name: "user_badges");

            migrationBuilder.DropTable(
                name: "user_lesson_progress");

            migrationBuilder.DropTable(
                name: "user_profiles");

            migrationBuilder.DropTable(
                name: "user_settings");

            migrationBuilder.DropTable(
                name: "user_vocabulary_progress");

            migrationBuilder.DropTable(
                name: "vocabulary_media");

            migrationBuilder.DropTable(
                name: "feedback_categories");

            migrationBuilder.DropTable(
                name: "user_subscriptions");

            migrationBuilder.DropTable(
                name: "practice_sessions");

            migrationBuilder.DropTable(
                name: "translation_sessions");

            migrationBuilder.DropTable(
                name: "badges");

            migrationBuilder.DropTable(
                name: "subscription_plans");

            migrationBuilder.DropTable(
                name: "lessons");

            migrationBuilder.DropTable(
                name: "vocabularies");

            migrationBuilder.DropTable(
                name: "course_modules");

            migrationBuilder.DropTable(
                name: "vocabulary_categories");

            migrationBuilder.DropTable(
                name: "courses");

            migrationBuilder.DropTable(
                name: "course_categories");

            migrationBuilder.DropTable(
                name: "media_assets");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "roles");
        }
    }
}

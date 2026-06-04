using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EXE101.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAvatarFramesAndUserAvatarFrames : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "active_frame_id",
                table: "user_profiles",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "avatar_frames",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    image_url = table.Column<string>(type: "text", nullable: false),
                    xp_price = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_avatar_frames", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "user_avatar_frames",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<long>(type: "bigint", nullable: false),
                    avatar_frame_id = table.Column<long>(type: "bigint", nullable: false),
                    purchased_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_avatar_frames", x => x.id);
                    table.ForeignKey(
                        name: "fk_user_avatar_frames_avatar_frames_avatar_frame_id",
                        column: x => x.avatar_frame_id,
                        principalTable: "avatar_frames",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_user_avatar_frames_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_user_profiles_active_frame_id",
                table: "user_profiles",
                column: "active_frame_id");

            migrationBuilder.CreateIndex(
                name: "ix_avatar_frames_code",
                table: "avatar_frames",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_user_avatar_frames_avatar_frame_id",
                table: "user_avatar_frames",
                column: "avatar_frame_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_avatar_frames_user_id_avatar_frame_id",
                table: "user_avatar_frames",
                columns: new[] { "user_id", "avatar_frame_id" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "fk_user_profiles_avatar_frames_active_frame_id",
                table: "user_profiles",
                column: "active_frame_id",
                principalTable: "avatar_frames",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_user_profiles_avatar_frames_active_frame_id",
                table: "user_profiles");

            migrationBuilder.DropTable(
                name: "user_avatar_frames");

            migrationBuilder.DropTable(
                name: "avatar_frames");

            migrationBuilder.DropIndex(
                name: "ix_user_profiles_active_frame_id",
                table: "user_profiles");

            migrationBuilder.DropColumn(
                name: "active_frame_id",
                table: "user_profiles");
        }
    }
}

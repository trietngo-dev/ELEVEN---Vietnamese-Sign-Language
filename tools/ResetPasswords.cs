using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using EXE101.Infrastructure.Persistence;
using EXE101.Domain.Entities;
using Microsoft.Extensions.Configuration;

var config = new ConfigurationBuilder()
    .SetBasePath(@"c:\Users\Triet\MyProject\vsl-platform\src\EXE101.Presentation")
    .AddJsonFile("appsettings.Development.json")
    .Build();

var connStr = config.GetConnectionString("DefaultConnection");
Console.WriteLine("Connecting to DB...");

var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
optionsBuilder.UseNpgsql(connStr).UseSnakeCaseNamingConvention();

using var db = new AppDbContext(optionsBuilder.Options);
var users = await db.Users.ToListAsync();
var roles = await db.Roles.ToListAsync();
var roleMap = roles.ToDictionary(r => r.Id, r => r.Name);

Console.WriteLine($"\nFound {users.Count} users in database:");

var newHash = BCrypt.Net.BCrypt.HashPassword("123456");

foreach (var u in users)
{
    u.PasswordHash = newHash;
    var roleName = roleMap.TryGetValue(u.RoleId, out var rName) ? rName : $"Role {u.RoleId}";
    Console.WriteLine($"[User #{u.Id}] Email: {u.Email,-35} | Name: {u.FullName,-25} | Role: {roleName}");
}

await db.SaveChangesAsync();
Console.WriteLine("\n>>> SUCCESS: All user passwords updated to '123456' <<<");

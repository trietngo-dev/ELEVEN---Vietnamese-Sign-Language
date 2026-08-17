# ========== Build Stage ==========
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy solution and project files first (leverage Docker cache)
COPY EXE101_BE_Eleven_Clean.sln ./
COPY src/EXE101.Domain/EXE101.Domain.csproj ./src/EXE101.Domain/
COPY src/EXE101.Application/EXE101.Application.csproj ./src/EXE101.Application/
COPY src/EXE101.Infrastructure/EXE101.Infrastructure.csproj ./src/EXE101.Infrastructure/
COPY src/EXE101.Presentation/EXE101.Presentation.csproj ./src/EXE101.Presentation/

# Restore NuGet packages
RUN dotnet restore EXE101_BE_Eleven_Clean.sln

# Copy all source code
COPY src/ ./src/

# Copy AI Models (ONNX model + classes.json)
COPY SignLanguageAI/AIModels/ ./SignLanguageAI/AIModels/

# Publish in Release mode
RUN dotnet publish src/EXE101.Presentation/EXE101.Presentation.csproj \
    -c Release \
    -o /app/publish

# ========== Runtime Stage ==========
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copy published output
COPY --from=build /app/publish ./

# Copy AI Models to match the relative path in appsettings
COPY --from=build /app/SignLanguageAI/AIModels/ ./SignLanguageAI/AIModels/

# Render assigns a dynamic PORT via environment variable
ENV ASPNETCORE_URLS=http://+:10000
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_USE_POLLING_FILE_WATCHER=true
ENV DOTNET_HOSTBUILDER__RELOADCONFIGONCHANGE=false

EXPOSE 10000

ENTRYPOINT ["dotnet", "EXE101.Presentation.dll"]


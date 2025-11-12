FROM hub.nexdev.net/base/dotnet/core/sdk:9.0-alpine AS builder

# Install Node.js and npm
RUN apk add --no-cache nodejs npm

WORKDIR /src

COPY *.sln .
COPY ONEHub.LandingPages/ONEHub.LandingPages.csproj ./ONEHub.LandingPages/
COPY ONEHub.LandingPages.Core/ONEHub.LandingPages.Core.csproj ./ONEHub.LandingPages.Core/
COPY ONEHub.Shared/ONEHub.Shared.csproj ./ONEHub.Shared/

RUN dotnet nuget add source https://nuget.nexdev.net/api/v2

RUN dotnet restore -v n ./ONEHub.LandingPages/ONEHub.LandingPages.csproj

COPY ONEHub.LandingPages/. ./ONEHub.LandingPages/
COPY ONEHub.LandingPages.Core/. ./ONEHub.LandingPages.Core/
COPY ONEHub.Shared/. ./ONEHub.Shared/

WORKDIR /src/ONEHub.LandingPages

RUN npm install --ignore-scripts && npm run build:prod

RUN dotnet publish -v n -r linux-x64 --self-contained false -o /app

FROM hub.nexdev.net/base/dotnet/core/aspnet:9.0-alpine AS base

RUN adduser --disabled-password \
  --home /app \
  --gecos '' dotnetuser && chown -R dotnetuser /app

USER dotnetuser

ENV DOTNET_HOSTBUILDER__RELOADCONFIGONCHANGE=false
ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

WORKDIR /app
COPY --from=builder /app .

ENV TZ="America/La_Paz"

ENTRYPOINT ["dotnet", "ONEHub.LandingPages.dll"]
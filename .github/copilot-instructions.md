# Copilot Instructions

## Project Overview

`Hangsolow.OptimizelyAudienceSearch` is a NuGet package for **Optimizely CMS 12** that injects a real-time search filter into the CMS "Who can see this content?" audience picker. The package implementation is a single-project library with no server-side runtime logic, just a DI registration hook and a client-side Dojo AMD module.

## Build & Pack

```bash
dotnet restore  # requires Optimizely NuGet source credentials (OPTIMIZELY_NUGET_TOKEN)
dotnet build --configuration Release
dotnet pack --no-build --configuration Release --output ./artifacts
```

There are no tests and no linter/formatter configured.

## NuGet Sources

The Optimizely package feed requires credentials. Locally, authenticate via the `optimizely` source in `nuget.config`:

```
https://api.nuget.optimizely.com/v3/index.json
```

In CI, `OPTIMIZELY_NUGET_TOKEN` is used as an environment variable to add this source.

## Local NuGet Versioning For Samples

When building packages locally for use in the sample project, always use a `-dev` version suffix.

- Required format: `<stable-version>-dev` (example: `1.2.3-dev`)
- Do not reference a plain stable version from local feeds in `samples/AlloySample`.
- Keep stable versions for tagged CI/release builds only.

Example local pack command:

```bash
dotnet pack --no-build --configuration Release -p:Version=1.2.3-dev --output ./artifacts
```

## Architecture

```
OptimizelyAudienceSearchExtensions.cs   ← IServiceCollection extension; registers the protected module name
build/Hangsolow.OptimizelyAudienceSearch.targets ← MSBuild targets; copies module files into consuming project output
src/.../modules/_protected/
  Hangsolow.OptimizelyAudienceSearch/
    module.config                       ← Dojo/Optimizely module manifest
    ClientResources/
      scripts/audience-enhancer.js      ← Dojo AMD module (MutationObserver-based DOM enhancement)
      styles/audience-enhancer.css      ← Styles for injected filter UI
```

**Flow:**
1. Consuming project calls `services.AddOptimizelyAudienceSearch()` in `Program.cs`/`Startup.cs`
2. MSBuild `.targets` file copies `modules/_protected/` into the consuming project's output at build time
3. Optimizely shell loads the protected module at CMS startup
4. `audience-enhancer.js` uses a `MutationObserver` to detect when the audience picker tooltip opens and injects the filter input

## Key Conventions

### C#
- File-scoped namespaces (`namespace Hangsolow.OptimizelyAudienceSearch;`)
- Nullable reference types enabled; implicit usings enabled
- Extension method pattern for all public API surface (`AddOptimizelyAudienceSearch` returns `IServiceCollection` for fluent chaining)

### JavaScript (Dojo AMD)
- Module definition: `define(["dojo/_base/declare", "epi/_Module"], function (declare, _Module) { ... })`
- All module logic goes in `initialize()` — the Dojo lifecycle entry point
- DOM selector constants use `UPPER_SNAKE_CASE` (e.g., `WIDGET_SELECTOR`, `MENU_ROW_SELECTOR`)
- Use `data-audience-enhanced` attribute as an idempotency flag to avoid double-processing widgets
- CSS classes follow the `epi-*` prefix convention used throughout Optimizely CMS

### Versioning & Release
- Versions are derived from Git tags (`v1.2.3` → `1.2.3`) by the release workflow
- The package targets `EPiServer.CMS.UI.Core` version range `[12.0.0, 13.0.0)`
- `.slnx` format is used (Visual Studio folder-based solution)

## Git workflow

When pushing code changes to GitHub, always follow this branching and PR convention:

### Branch naming
Create a new branch using the pattern:
```
feature/copilot/<short-description>
```
Examples: `feature/copilot/add-search-tool`, `feature/copilot/fix-publish-trigger`

```bash
git checkout -b feature/copilot/<short-description>
```

### Pull requests
Always open PRs against the **`release`** branch — never directly to `main`.

The `release` branch triggers a beta release (`-beta.N`) via `release.yml`. Once the beta is verified, the repo owner merges `release` → `main` to produce a stable release.

```bash
git push origin feature/copilot/<short-description>
gh pr create --base release --title "<title>" --body "<description>"
```

## Samples

- `samples/AlloySample` is the Alloy CMS app referencing `Hangsolow.OptimizelyAudienceSearch` via a `PackageReference`. The pinned version must be a locally-built `-dev` package (e.g. `1.2.3-dev`). Build a local package first (`dotnet pack --configuration Release -p:Version=<x.y.z-dev> --output ./artifacts`), then update the `PackageReference` version in `samples/AlloySample/AlloySample.csproj` to match.
- `samples/AlloySample.AppHost` hosts the sample with Aspire and points at the sample web project through `Projects.AlloySample`.
- The solution file groups these under `/samples/` alongside `/src/`.

### Running the Sample App with Aspire
Start by reading the Aspire skill. Then check whether Aspire is already running.

- If it is running, stop it first.
- Start the Alloy sample CMS with SQL Server using Aspire.

Run:

```bash
aspire start
```

This command:
1. Builds the solution
2. Starts a persistent SQL Server container with Optimizely database
3. Launches the Alloy sample web app
4. Outputs the web resource URLs and Aspire dashboard link

**Resource endpoints** (once running):
- Web app (HTTPS): `https://localhost:5000`
- Web app (HTTP): `http://localhost:5001`
- Aspire dashboard: `https://localhost:17200` (with auth token)

**To retrieve the CMS admin password:**

The cms-password parameter is auto-generated on first startup. Get it by using the Aspire CLI to view secrets.

```bash
aspire secret get Parameters:cms-password
```

Or inspect the AppHost parameter store manually (password is persisted in the Aspire backend).

**Creating the admin account:**

1. Visit `https://localhost:5000` or `http://localhost:5001`
2. If the CMS has no admin account, you'll be prompted during first startup
3. Create account:
   - **Username**: `admin`
   - **Email**: `admin@localhost`
   - **Password**: Use the generated cms-password (or set your own if prompted)

**Verifying the addon:**

1. Log in to the CMS admin shell (`/EPiServer/CMS` path)
2. Navigate to **Visitors Groups** or **Audiences** admin UI
3. Click to edit an audience → open the "Who can see this content?" picker
4. Confirm the real-time search filter input is visible at the top of the audience list

**Troubleshooting:**

- Check resource status: `aspire describe`
- View console logs: `aspire logs web`
- View structured traces: `aspire otel logs web`
- Restart a resource: `aspire resource web rebuild` (applies code changes and restarts)
- Stop all resources: `Ctrl+C` in the terminal running `aspire start`


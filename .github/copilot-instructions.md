# Copilot Instructions

## Project Overview

`Hangsolow.OptimizelyAudienceSearch` is a NuGet package for **Optimizely CMS 12** that injects a real-time search filter into the CMS "Who can see this content?" audience picker. It is a single-project solution with no server-side runtime logic — just a DI registration hook and a client-side Dojo AMD module.

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

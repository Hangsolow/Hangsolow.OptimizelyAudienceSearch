# Hangsolow.OptimizelyAudienceSearch

A lightweight Optimizely CMS 12 shell module that adds a **real-time search/filter bar** to the *"Who can see this content?"* audience picker in the CMS editorial UI.

When editors personalize content blocks, the audience list can grow long. This module injects a live filter input so editors can quickly find the right visitor group without scrolling.

---

## Features

- 🔍 Real-time filter input inside the audience tooltip
- ✖ Clear button and Escape-key support
- 🖊 Also enhances the Rich Text Editor personalization dialog (scrollable list)
- Zero server-side dependencies — pure client-side Dojo AMD module
- One-line setup

---

## Compatibility

| Optimizely CMS | .NET  |
|---------------|-------|
| 12.x          | 10 |

---

## Installation

```bash
dotnet add package Hangsolow.OptimizelyAudienceSearch
```

Or add to your `.csproj`:

```xml
<PackageReference Include="Hangsolow.OptimizelyAudienceSearch" Version="1.0.0" />
```

> **Note:** This package requires the Optimizely NuGet feed. Add it to your `nuget.config`:
> ```xml
> <add key="optimizely" value="https://api.nuget.optimizely.com/v3/index.json" />
> ```

---

## Setup

In your `Startup.cs` or `Program.cs`, call `AddOptimizelyAudienceSearch()` as part of your service configuration:

```csharp
services
    .AddCmsAspNetIdentity<ApplicationUser>()
    .AddCms()
    .AddOptimizelyAudienceSearch();  // ← add this
```

That's it. The module registers itself with Optimizely's protected module system and its client resources are served automatically.

---

## How it works

The package ships a [protected Optimizely shell module](https://docs.developers.optimizely.com/content-management-system/docs/create-shell-modules) containing a Dojo AMD module. On install, an MSBuild `.targets` file copies the module files into your project's `modules/_protected/Hangsolow.OptimizelyAudienceSearch/` directory. The `AddOptimizelyAudienceSearch()` extension method registers the module name with `ProtectedModuleOptions` so the CMS shell can load it.

---

## Contributing

Pull requests are welcome. Please open an issue first to discuss any significant changes.

---

## License

[MIT](LICENSE)

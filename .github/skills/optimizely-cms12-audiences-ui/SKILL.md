---
name: optimizely-cms12-audiences-ui
description: "Create, edit, and apply Optimizely CMS 12 audiences (visitor groups) in the editor interface using browser automation. Use for audience setup, criteria selection, match logic (All/Any/Points), access-rights availability, and personalization validation via playwright-cli or browser tools."
argument-hint: "Describe your audience goal, criteria, and whether to automate create/edit/apply/validate."
user-invocable: true
---

# Optimizely CMS 12 Audiences In Editor UI

## What This Skill Produces

- A repeatable browser-driven workflow to create, edit, duplicate, delete, and apply audiences in Optimizely CMS 12.
- A validation checklist so the run can confirm audience behavior and UI persistence.
- Branching guidance for criteria match strategy: `All`, `Any`, or `Points`.

## Use This Skill When

- You need to manage audiences from the CMS 12 `Audiences` tab.
- You want to automate the editor UI with `playwright-cli` or with built-in browser tools.
- You need to apply an audience to personalized content and verify the setup end-to-end.

## Do Not Use This Skill When

- You are targeting CMS 11 or earlier UI flows.
- You need to author custom audience criteria in code.
- You only need API-level automation without UI validation.

## References

- Official docs: https://support.optimizely.com/hc/en-us/articles/20139660085133-Audiences
- Related docs from that page:
  - https://support.optimizely.com/hc/en-us/articles/20717589508749-Audience-criteria
  - https://support.optimizely.com/hc/en-us/articles/4413192355085

## Defaults

- Default automation path: built-in browser tools (`open/read/click/type`) for most runs.
- Fallback automation path: `playwright-cli` when the user explicitly requests CLI-based browser control or existing scripts depend on it.

## Preconditions

1. Confirm the user can access the CMS `Audiences` tab.
2. If missing access, ensure the user is in `VisitorGroupAdmins` (or equivalent role policy in the environment).
3. Confirm target site/environment, locale, and whether analytics/statistics should be enabled.
4. Confirm if the audience must be available for access-right settings on pages/files.

## Procedure

1. Capture intent before opening the UI.
   - Define audience `Name` and `Notes`.
   - Define criteria list and expected operator values.
   - Choose match mode:
     - `All`: every criterion must be true.
     - `Any`: at least one criterion must be true.
     - `Points`: weighted criteria with a threshold.

2. Open CMS editor and navigate to `Audiences`.
    - Default path (built-in browser tools):
       - Open page in a browser tab.
       - Perform interactive sign-in.
       - Navigate via click/type actions to CMS editor shell.
       - Open `Audiences` and continue the same workflow.
    - Fallback path (`playwright-cli`):
       - Open browser session.
       - Sign in to CMS.
       - Navigate to the CMS admin/editor shell.
       - Open `Audiences`.

3. Create audience.
   - Click `Create Audience`.
   - Enter `Name` and `Notes`.
   - Set optional flags:
     - `Enable statistics for this audience`.
     - `Make this audience available when setting access rights for pages and files`.
   - Click `Add criteria`, choose criterion type, and configure values.
   - Add additional criteria as needed.
   - Set `Match` to `All`, `Any`, or `Points`.
   - If `Points` is selected, set criterion points and threshold.
   - Save using `Create Audience`.

4. Apply audience to content personalization.
   - Open a page/block in edit mode.
   - Add or select a personalized content variant.
   - Choose the newly created audience.
   - Save/publish according to environment policy.

5. Validate behavior.
   - Validate audience appears in selection lists.
   - Validate criteria and match mode persisted after refresh.
   - Validate personalized variant is correctly associated with the audience.
   - If feasible, emulate visitor context and verify expected content outcome.

6. Optional maintenance operations.
   - Edit: open audience, change criteria/settings, and save.
   - Duplicate: use `More > Duplicate`, rename, then adjust criteria.
   - Delete: use `More > Delete` and confirm.

## Execution Checklist

- [ ] Confirm access to `Audiences` tab.
- [ ] Capture audience intent (`Name`, `Notes`, criteria, match mode).
- [ ] Create or edit the audience.
- [ ] Apply audience to personalized content.
- [ ] Run validation checks and record pass/fail.
- [ ] If needed, iterate until all checks pass.

## Decision Logic

- If audience entry criteria are strict and conjunctive, use `All`.
- If audience is broad and any signal is sufficient, use `Any`.
- If criteria importance varies, use `Points` and set required criteria only where needed.
- If audience should later be used in content access-right assignment, enable access-right availability at creation time.

## Quality Checks (Definition Of Done)

- Audience is visible in the `Audiences` list with correct `Name` and `Notes`.
- All configured criteria render with expected values after reload.
- Correct match strategy (`All`/`Any`/`Points`) is saved.
- Optional flags (statistics and access-right availability) match requirements.
- Audience is selectable in personalization UI and linked to intended content variant.

## Validation Loop

1. Perform create/edit/apply steps.
2. Run all quality checks.
3. If any check fails, return to the relevant step, fix configuration, and re-run checks.
4. Finalize only when all checks pass.

## Gotchas

- CMS 12 audience UI differs from CMS 11; do not follow CMS 11 navigation.
- Renaming an audience already used for access-right settings can break those settings.
- Audiences used in access rights grant read access only.
- If `Audiences` tab is missing, check role membership (for example `VisitorGroupAdmins`) before troubleshooting criteria.

## Suggested Automation Output Format

When running this skill, return:

1. Audience summary (name, notes, match mode, criteria count).
2. Actions taken (create/edit/apply/validate).
3. Validation results (pass/fail per quality check).
4. Follow-up actions needed (permissions, missing criteria types, environment constraints).

## Prompt Starters

- "Create an audience where URL referrer equals a campaign search result page, then apply it to homepage hero content."
- "Edit audience `B2B Prospects` to use `All` criteria and validate it still appears in personalization options."
- "Duplicate audience `Newsletter Leads`, rename it to `Newsletter Leads - EMEA`, add URL criteria, and verify persistence."
---
name: setup-pstack
description: Configure which Claude model pstack uses per role. Writes an always-loaded user rule that overrides the skill defaults. Use for /setup-pstack, "configure pstack models", "pstack budget", or changing pstack's model choices.
---

# Setup pstack

Write `~/.claude/rules/pstack-models.md`, a user-level rule Claude Code loads into every session, that sets pstack's model per role.

## Steps

### 1. Know the models

Agent subagents take a `model` alias: `opus`, `fable`, `sonnet`, or `haiku`. A full model id (for example `claude-opus-5-5`) also works. `inherit-parent` and `auto` are pstack aliases, not Agent values: both mean omit `model`, so the role runs on the parent chat model. If the user names a full id, confirm it by spawning a one-line Agent call with that `model` before writing it.

### 2. Load current state

The default role-to-model mapping is the rule shape shown in step 5 below. If `~/.claude/rules/pstack-models.md` already exists, read it and treat its `# budget` line and its role values as the current choices. Otherwise start from those defaults. A line whose role is not in step 5, such as `how critics`, is from a retired role. Drop it.

### 3. Budget, map, and confirm

**(a) Ask for a budget.** Use AskUserQuestion. Offer these four options with these exact labels, and name the current budget when the rule records one.

- `unlimited — keep defaults`
- `large — opus judgment, sonnet code`
- `medium — sonnet everywhere`
- `small — sonnet judgment, haiku code`

**(b) Apply it.** Build the working table from the step 5 defaults, and on a re-run keep any role the user changed by hand or set to an alias (`inherit-parent`, `auto`). `unlimited` keeps the table. `large` replaces `fable` with `opus` and keeps the rest. `medium` sets every real entry to `sonnet`. `small` sets judgment roles (`judgment and prose`, `hardest tasks`, `how explainer`, `why synthesizer`, `reflect judgment, divergent, synthesizer`) to `sonnet` and every other entry to `haiku`. Panel lists keep their length, so fan-out counts do not change.

**(c) Show the roles and confirm.** Show every role with its model. Also list each line step 2 dropped. Ask whether to accept as-is or change specific roles, offering `opus`, `fable`, `sonnet`, `haiku`, `inherit-parent`, and `auto`. Use AskUserQuestion. For panel roles (arena runners, architect runners, interrogate reviewers) the value is a list, and one subagent runs per entry, alias entries included, so the list length sets the count. `arena cross-judge pool` is also a list, but Arena selects one value from it that differs from the parent's model when possible. `swarm workers` is the default model for every worker unless a race or comparison assigns another model per arm.

### 4. Validate

Every value is `opus`, `fable`, `sonnet`, `haiku`, `inherit-parent`, `auto`, or a full id confirmed in step 1. Otherwise stop and ask again.

### 5. Write the rule

Write `~/.claude/rules/pstack-models.md` with a `# budget` line with the chosen label and one line per role, using the same labels poteto-mode uses. No frontmatter: a rule without `paths` loads in every session. Overwrite the whole file so re-runs stay idempotent. Shape:

```
# pstack model configuration. One line per role. Delete a line to fall back to the skill default.
# `inherit-parent` or `auto` as a value: the role runs on the parent chat model (omit Agent `model`). Alias entries in a panel list still count toward its fan-out.
# budget: unlimited — keep defaults
feature, refactoring: sonnet
bug-fix: sonnet
perf-issue: sonnet
hillclimb: sonnet
judgment and prose: opus
hardest tasks: opus
how explorer: sonnet
how explainer: opus
why investigators: sonnet
why synthesizer: opus
reflect tooling: fable
reflect judgment, divergent, synthesizer: opus
arena runners: opus, fable, sonnet
arena cross-judge pool: opus, fable, sonnet
swarm workers: sonnet
architect runners: opus, fable, sonnet
interrogate reviewers: opus, fable, sonnet
```

### 6. Confirm

Tell the user the rule was written and that it applies to new sessions. Re-running this skill updates it.

### 7. Offer a verification skill (optional)

Check whether the project has a way to drive the real app for proof (a `.claude/skills/verify-*` skill, or an existing harness). If not, offer once: "want a project-local verification skill, so agents can drive the app the way a user does and prove changes work? I can generate one with /pstack:create-verification-skill." On yes, Read `<pstack>/skills/create-verification-skill/SKILL.md` and follow it. On no, move on without pushing.

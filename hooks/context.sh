#!/usr/bin/env bash
set -euo pipefail

root="${CLAUDE_PLUGIN_ROOT}"
slug=$(printf '%s' "${CLAUDE_PROJECT_DIR:-$PWD}" | sed 's#[/.]#-#g')
text="pstack is installed at ${root} (written <pstack> in pstack skills). Its skills are user-only slash commands (/pstack:<name>), so the Skill tool refuses them: when a pstack skill or playbook routes you to another pstack skill, Read <pstack>/skills/<name>/SKILL.md and follow it, resolving its relative paths against that skill's directory. The pstack store for this project is ~/.claude/pstack/${slug}/."

if [ "${1:-session}" = subagent ]; then
	printf '{"hookSpecificOutput":{"hookEventName":"SubagentStart","additionalContext":%s}}\n' "$(printf '%s' "$text" | node -e 'process.stdout.write(JSON.stringify(require("fs").readFileSync(0,"utf8")))')"
else
	printf '%s\n' "$text"
fi

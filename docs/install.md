# Signal Cover Studio — Installation Guide

## For Humans

Copy this to your AI agent (Claude Code, Codex, or any agent that loads Agent Skills):

```text
帮我安装 Signal Cover Studio：https://raw.githubusercontent.com/RZX00/signal-cover-studio/main/docs/install.md
```

---

## For AI Agents

### Goal

Install the `signal-cover-studio` skill folder from the GitHub repo that hosts this file into the skills directory of the agent you are running in. Then, with the user's approval, install the skill's Node dependencies and its browser.

The repository contains:

- `signal-cover-studio/` — the skill folder to install (`SKILL.md`, `references/`, `scripts/`, `vendor/cover-edit/`)
- `signal-cover-studio.skill` — a zip of the same folder; you do not need it
- `docs/install.md` — this guide

The repository does **not** contain `node_modules` or any browser binary. The skill cannot render until Step 5 is done.

### Boundaries

- Do not use `sudo` or administrator rights unless the user explicitly approves.
- Do not modify files outside the install target and a temporary directory.
- Do not run `npm install` or download Chromium until the user approves (Step 5).
- Do not unpack the repo into the user's current project unless they ask.

### Step 1: Pick the install target

Use the directory your own agent loads skills from:

| Agent | Personal install (all projects) | Project install (current repo only) |
|---|---|---|
| Claude Code | `~/.claude/skills/signal-cover-studio/` | `<project>/.claude/skills/signal-cover-studio/` |
| Codex and other agents that read `~/.agents/skills` | `~/.agents/skills/signal-cover-studio/` | `<project>/.agents/skills/signal-cover-studio/` |

If your agent is not listed, use the skills directory documented by that agent. If you cannot determine it, ask the user. Default to the personal install unless the user asks for a project install.

On Windows, `~` is the user's home folder, for example `C:\Users\<name>`.

### Step 2: Download the repo to a temporary directory

Derive the archive URL from the raw URL of this file:

- `https://raw.githubusercontent.com/<owner>/<repo>/<branch>/docs/install.md`
- → `https://github.com/<owner>/<repo>/archive/refs/heads/<branch>.zip`

Download and extract it into the system temporary directory (`/tmp` on macOS and Linux, `$env:TEMP` in PowerShell). `git clone --depth 1 https://github.com/<owner>/<repo>.git` works too.

The repository and the skill folder share the same name, so the folder to copy is one level down:

- source: `<extracted repo root>/signal-cover-studio/` — it contains `SKILL.md` directly
- target: `<skills directory>/signal-cover-studio/SKILL.md`

The zip extracts to `signal-cover-studio-<branch>/signal-cover-studio/`; a clone gives `signal-cover-studio/signal-cover-studio/`.

### Step 3: Validate and copy

1. Confirm the source folder contains `SKILL.md` and `vendor/cover-edit/bin/cover-edit.mjs`. If either is missing, stop and tell the user the download is not a valid skill bundle.
2. If the target folder already exists, ask the user before replacing it. After they confirm, delete the old folder first, then copy, so files from the old version do not linger.
3. Copy the whole source folder to the target.
4. Delete the temporary directory.

macOS / Linux example (personal install for Claude Code):

```bash
tmp=$(mktemp -d)
git clone --depth 1 https://github.com/RZX00/signal-cover-studio.git "$tmp/repo"
mkdir -p ~/.claude/skills
cp -R "$tmp/repo/signal-cover-studio" ~/.claude/skills/
rm -rf "$tmp"
```

Windows PowerShell example (personal install for Codex):

```powershell
$tmp = Join-Path $env:TEMP "scs-install"
Invoke-WebRequest https://github.com/RZX00/signal-cover-studio/archive/refs/heads/main.zip -OutFile "$tmp.zip"
Expand-Archive "$tmp.zip" -DestinationPath $tmp -Force
New-Item -ItemType Directory -Force "$HOME\.agents\skills" | Out-Null
Copy-Item "$tmp\signal-cover-studio-main\signal-cover-studio" "$HOME\.agents\skills\" -Recurse
Remove-Item "$tmp.zip"; Remove-Item $tmp -Recurse
```

### Step 4: Tell the user how to load it

- Claude Code watches its skills directories, so the skill is usually available right away. If this is the user's first skill (the skills directory did not exist when the session started), tell them to run `/reload-skills` or restart Claude Code.
- Codex detects new skills automatically; if the skill does not appear, tell the user to restart Codex.

### Step 5: Install runtime dependencies (ask first)

Node.js and npm must already be on the machine. Check with `node --version`; if missing, tell the user and stop here.

Ask the user:

> Skill files are installed. To render covers, I also need to run `npm install` in the skill's `vendor/cover-edit/` folder and download a Chromium browser (several hundred MB) for headless screenshots. Shall I go ahead?

After the user agrees, run in the **installed** skill folder:

```bash
cd <skills directory>/signal-cover-studio/vendor/cover-edit
npm install
npx playwright install chromium
```

If the user declines, stop. If a later run fails with `Cannot find package 'playwright'` or a browser-launch error, these two commands are the fix.

### Success message

> Installed `signal-cover-studio` into `<target>`. Start a new session, then ask me to make covers from an article, for example: 用 signal-cover-studio，把这篇文章做成公众号封面、小红书封面、X 配图和公众号 HTML：<文章 .md 路径>

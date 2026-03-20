# Signal Cover Studio — Installation Guide

## For Humans

Copy this to your AI agent:

```text
帮我安装 Signal Cover Studio：https://raw.githubusercontent.com/RZX00/signal-cover-studio/main/docs/install.md
```

---

## For AI Agents

### Goal

Install the `signal-cover-studio` skill from the same GitHub repo as this `install.md` file into the user's OpenClaw skills directory.

This repository contains a **self-contained skill release**:

- `signal-cover-studio/` — the installable skill folder
- `signal-cover-studio/vendor/cover-edit/` — bundled runtime
- `signal-cover-studio/vendor/cover-edit/node_modules/` — bundled Node dependencies
- `docs/install.md` — this guide

### Boundaries

- Do **not** use `sudo` unless the user explicitly approved.
- Do **not** modify files outside the skill install target and temporary directories.
- Do **not** auto-install extra system packages just because the skill may use them later.
- Do **not** unpack or install into the user's active project root unless they explicitly asked.

### Install target

Preferred target:

- `<workspace>/skills/signal-cover-studio`

Fallback target:

- `~/.openclaw/skills/signal-cover-studio`

If both exist, prefer the workspace-local `skills/` folder unless the user asks for a global install.

### Source derivation

If this file was loaded from:

- `https://raw.githubusercontent.com/<owner>/<repo>/<branch>/docs/install.md`

then derive:

- repo page: `https://github.com/<owner>/<repo>`
- branch zip: `https://github.com/<owner>/<repo>/archive/refs/heads/<branch>.zip`

### Install steps

1. Download the repo zip to a temporary directory.
2. Extract it.
3. Verify `signal-cover-studio/SKILL.md` exists.
4. Verify `signal-cover-studio/vendor/cover-edit/bin/cover-edit.mjs` exists.
5. Copy the whole `signal-cover-studio/` folder into the install target.
6. Tell the user to start a **new OpenClaw session** so the skill is loaded.

### Important runtime note

The repo already bundles the local Node runtime and `node_modules`, but a fresh machine may still need Playwright browser binaries later.

If the user actually runs the skill and gets a browser-launch error, then suggest:

```bash
cd <installed-skill>/vendor/cover-edit
npx playwright install chromium
```

Do not run this automatically unless the user explicitly asks.

### Success message template

> Installed `signal-cover-studio` into `<target>`. Start a new OpenClaw session and then invoke it normally.

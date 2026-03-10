# Solar System Project Workflow Checklist

## Before Starting Development

- [ ] Read `CLAUDE.md` for project conventions and current focus
- [ ] Read `docs/session-handoff.md` for previous session context
- [ ] Read `docs/lessons.md` for project-specific patterns
- [ ] Check git status for uncommitted changes or stashes

## During Development

- [ ] Serve locally (`npx serve .`) — ES6 modules require HTTP server, not file://
- [ ] Test changes in browser, check console for errors
- [ ] Follow conventions in CLAUDE.md (tokens, VISUAL_CONFIG, etc.)

## After Completing Any Task

- [ ] Test implementation in browser before marking complete
- [ ] Update `docs/to-do-list.md` — mark completed items, add new tasks discovered
- [ ] If lessons were learned, update `docs/lessons.md`

## Session End

- [ ] Update `docs/session-handoff.md` with what was done and what's next
- [ ] Check if `CLAUDE.md` needs updates (new conventions, stale info)
- [ ] Commit with conventional commit format

## Development Environment

- **IDE**: VS Code with Claude Code extension
- **Server**: `npx serve .` or `python3 -m http.server`
- **Why HTTP required**: ES6 module imports fail under file:// protocol due to CORS

# Solar System Project Workflow Checklist

## Before Starting Development

- [ ] Run `giga_autorun` to read current project state
- [ ] Review memory.md for current status
- [ ] Review to-do-list.md for next priorities
- [ ] **REQUIRED**: Ensure Cursor IDE with Live Server extension is set up
- [ ] **REQUIRED**: Test that http://127.0.0.1:5500/solarsystem.html loads correctly

## During Development

- [ ] Always test changes via Live Server (not file:// protocol)
- [ ] Verify ES6 module imports work correctly
- [ ] Test new features at http://127.0.0.1:5500/solarsystem.html
- [ ] Check browser console for any errors

## After Completing Any Task

- [ ] **REQUIRED**: Test implementation on Live Server before marking complete
- [ ] Update `docs/to-do-list.md`:
  - [ ] Mark completed items as [x]
  - [ ] Add any new tasks discovered
- [ ] Update `.giga/memory/memory.md`:
  - [ ] Update "Current Development Status"
  - [ ] Update architecture/technical details if changed
  - [ ] Update preferences if workflow changed

## Major Milestone Completion

- [ ] **REQUIRED**: Full testing on Live Server
- [ ] Update project overview in memory.md
- [ ] Review and update all technical details
- [ ] Update deployment/structure information
- [ ] Consider if new sections needed in either file

## Development Environment Requirements

### Critical Setup

- **IDE**: Cursor with Live Server extension installed
- **Testing URL**: http://127.0.0.1:5500/solarsystem.html
- **Why Required**: ES6 modules need HTTP server due to CORS restrictions

### Testing Standards

- Never test with file:// protocol (will break ES6 modules)
- Always verify Live Server is running before testing
- Check browser console for module loading errors
- Test all interactive features (scaling, audio, visual effects)

## File-Specific Reminders

### Memory.md Updates When:

- Project structure changes (files added/removed/reorganized)
- Technology stack changes
- Development priorities shift
- Architecture decisions made
- **New**: Development environment or testing requirements change

### To-Do-List.md Updates When:

- Tasks completed
- New requirements discovered
- Priorities reordered
- Scope changes

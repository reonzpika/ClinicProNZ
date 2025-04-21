# Git Workflow Guide

This guide outlines the best practices for managing Git branches and common Git operations in our project.

## Branch Management Best Practices

### Main Branch Protection
- Keep `main` (or `master`) branch stable
- Never commit directly to main
- Always work on feature branches

### Branch Naming Convention
Use descriptive, hyphenated names with prefixes:
- `feature/` - for new features (e.g., `feature/live-transcription`)
- `fix/` - for bug fixes (e.g., `fix/login-error`)
- `hotfix/` - for urgent fixes (e.g., `hotfix/security-patch`)
- `chore/` - for maintenance tasks (e.g., `chore/update-dependencies`)
- `docs/` - for documentation (e.g., `docs/api-guide`)

## Common Workflows

### Starting a New Feature

1. Update main branch:
```powershell
git checkout main
git pull
```

2. Create new feature branch:
```powershell
git checkout -b feature/your-feature-name
```

### Working on Your Feature

1. Make changes and commit regularly:
```powershell
git add .                  # Stage all changes
# Or stage specific files:
git add src/components/YourComponent.tsx

git commit -m "feat: add new component"  # Commit with conventional message
```

2. Push changes to remote:
```powershell
# First time pushing branch:
git push -u origin feature/your-feature-name

# Subsequent pushes:
git push
```

### Keeping Your Branch Updated

1. Update with latest main:
```powershell
git checkout main
git pull
git checkout feature/your-feature-name
git merge main
```

### Completing Your Feature

1. Ensure your branch is up to date with main (see above)

2. Create a Pull Request (PR) on GitHub/GitLab:
   - Write clear description
   - Request reviews if needed
   - Address feedback

3. After PR approval, merge into main:
   - Use platform's "Merge" button (recommended)
   - Or merge locally:
   ```powershell
   git checkout main
   git merge feature/your-feature-name
   git push
   ```

4. Clean up:
```powershell
git branch -d feature/your-feature-name        # Delete local branch
git push origin --delete feature/your-feature-name  # Delete remote branch
```

## Common Scenarios and Commands

### Stashing Changes
Save changes without committing:
```powershell
git stash                  # Save changes
git stash list            # List saved stashes
git stash pop             # Apply and remove latest stash
git stash apply stash@{n} # Apply specific stash
git stash drop stash@{n}  # Delete specific stash
```

### Undoing Changes
```powershell
git reset --soft HEAD~1   # Undo last commit, keep changes staged
git reset --mixed HEAD~1  # Undo last commit, keep changes unstaged
git reset --hard HEAD~1   # Undo last commit and discard changes (careful!)
git checkout -- file.txt  # Discard changes in specific file
```

### Viewing Status and History
```powershell
git status                # Show working tree status
git log                   # View commit history
git log --oneline        # Compact commit history
git branch               # List local branches
git branch -a            # List all branches (including remote)
git remote -v            # List remote repositories
```

### Resolving Conflicts

1. When conflicts occur:
```powershell
git status               # Check which files have conflicts
```

2. Open conflicted files and look for conflict markers:
```
<<<<<<< HEAD
your changes
=======
their changes
>>>>>>> branch-name
```

3. Resolve conflicts:
   - Edit files to keep desired changes
   - Remove conflict markers
   - Save files

4. Complete the merge:
```powershell
git add .                # Stage resolved files
git commit               # Complete the merge commit
```

## Conventional Commit Messages

Format: `type(scope): description`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, etc)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or modifying tests
- `chore`: Changes to build process or auxiliary tools

Examples:
```
feat(auth): add login with Google
fix(api): handle timeout errors
docs(readme): update installation steps
```

## Tips and Best Practices

1. Commit Often:
   - Make small, focused commits
   - Each commit should represent one logical change
   - Use meaningful commit messages

2. Keep Branches Updated:
   - Regularly merge main into your feature branch
   - Resolve conflicts early

3. Before Creating PR:
   - Ensure all tests pass
   - Review your own changes
   - Update documentation if needed

4. Branch Hygiene:
   - Delete merged branches
   - Keep branch names consistent with conventions
   - Don't reuse branches for multiple features

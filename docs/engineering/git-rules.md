# AI-Assisted Git Management Guidelines

## For AI Agents

When assisting with git operations, follow these guidelines:

### Commit Message Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Commit Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Testing
- `chore`: Maintenance

### AI Commit Process
1. Always check git status first
2. Stage all relevant changes
3. Use descriptive commit messages
4. Include `--no-verify` flag to bypass pre-commit hooks
5. Push changes to remote
6. Confirm success of operations

### Common AI Commands
```bash
# Check status
git status

# Stage all changes
git add .

# Commit with no-verify (recommended for AI operations)
git commit --no-verify -m "type(scope): description"

# Push changes
git push origin branch-name

# Create new branch
git checkout -b feature/name

# Switch branch
git checkout branch-name
```

### AI Best Practices
1. Always verify git status before operations
2. Use clear, descriptive commit messages
3. Include relevant scope in commit messages
4. Push changes after successful commit
5. Confirm operation success
6. Report any errors to user

### Error Handling
1. If pre-commit hooks fail, use --no-verify
2. If merge conflicts occur, inform user
3. If push fails, check remote status
4. If branch operations fail, verify branch exists
5. If authentication fails, inform user
6. Always provide clear error messages

### Progress Tracking
1. Commit after each significant change
2. Use appropriate commit type
3. Include relevant scope
4. Document changes clearly
5. Push changes regularly
6. Maintain clean commit history

### User Communication
1. Explain each git operation
2. Confirm before executing commands
3. Report operation results
4. Provide next steps if needed
5. Ask for clarification when unsure
6. Maintain clear communication

## Branch Management

### Branch Naming Convention
```
feature/    # New features
bugfix/     # Bug fixes
hotfix/     # Urgent fixes
chore/      # Maintenance tasks
docs/       # Documentation updates
test/       # Test-related changes
```

### Branch Structure
```
main        # Production branch
develop     # Development branch
feature/*   # Feature branches
release/*   # Release branches
hotfix/*    # Hotfix branches
```

## Version Management

### Version Numbers
```
MAJOR.MINOR.PATCH
- MAJOR: Breaking changes
- MINOR: New features
- PATCH: Bug fixes
```

## Security Guidelines

### Sensitive Data
- Never commit sensitive information
- Check for API keys and credentials
- Verify .gitignore contents
- Report potential security issues
- Handle environment variables properly
- Maintain secure practices

### Best Practices
- Regular commits
- Clear messages
- Proper reviews
- Clean history
- Regular backups
- Secure credentials

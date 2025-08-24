# Pre-Commit Testing Setup

This repository includes a pre-commit hook that automatically runs all tests before allowing commits. This ensures code quality and prevents broken code from entering the repository.

## What the Pre-Commit Hook Does

The hook runs the following tests in order:

1. **API Tests** (`npm test`)
   - Tests Express.js server endpoints
   - Validates request/response handling
   - Checks error handling

2. **E2E Tests** (`npm run test:e2e`)
   - Full browser testing with Playwright
   - Tests complete user workflows
   - Validates frontend-backend integration

3. **Python Tests** (`pytest tests/`)
   - Backend unit tests (if pytest is installed)
   - Image comparison logic validation
   - Utility function testing

## Installation

The pre-commit hook is automatically created in `.git/hooks/pre-commit` and is executable.

## Bypassing (NOT RECOMMENDED)

If you absolutely need to commit without running tests (NOT RECOMMENDED), use:

```bash
git commit --no-verify -m "Your commit message"
```

**WARNING**: Only use `--no-verify` in emergency situations. All code should pass tests before being committed.

## Testing Locally Before Committing

To run the same tests that the pre-commit hook runs:

```bash
# Run all tests
npm run test:all

# Or run individually
npm test                # API tests
npm run test:e2e       # E2E tests
pytest tests/          # Python tests
```

## Benefits

- 🛡️ **Prevents broken code** from being committed
- 🚀 **Maintains code quality** automatically
- 🔍 **Catches issues early** in the development process
- 📈 **Improves team confidence** in the codebase
- 🤝 **Ensures consistent testing** across all developers

Remember: **Quality code is tested code!**
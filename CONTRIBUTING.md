# Contributing to FridgeScout

Thank you for your interest in contributing to FridgeScout! 🎉

## Code of Conduct

Be respectful, inclusive, and constructive. We're all here to make food waste reduction easier for everyone.

## How Can I Contribute?

### 🐛 Reporting Bugs

1. Check [existing issues](https://github.com/nicolepyzza/fridgescout/issues) first
2. Use the bug report template
3. Include:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - iOS version & device model
   - Screenshots/videos if applicable

### 💡 Suggesting Features

1. Check [existing feature requests](https://github.com/nicolepyzza/fridgescout/issues?q=is%3Aissue+label%3Aenhancement)
2. Open a new issue with:
   - Clear use case
   - Why it's valuable
   - Implementation ideas (optional)

### 🔧 Pull Requests

1. **Fork & clone** the repository
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

3. **Make your changes**:
   - Follow existing code style
   - Add TypeScript types
   - Test thoroughly on iOS
   - Write clear commit messages

4. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   feat: add new feature
   fix: resolve bug
   docs: update documentation
   style: format code
   refactor: restructure without changing behavior
   test: add or update tests
   chore: update build process
   ```

5. **Push** to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```

6. **Open a Pull Request**:
   - Describe what changed and why
   - Link related issues
   - Add screenshots for UI changes
   - Wait for review and address feedback

## Development Setup

### Prerequisites

- Node.js 20+ (LTS)
- Xcode (for iOS development)
- Expo account (free)

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/fridgescout.git
cd fridgescout

# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS
npx expo run:ios
```

### Project Structure

```
app/
├── (tabs)/
│   ├── index.tsx      # Main home screen
│   └── _layout.tsx    # Tab navigation
└── _layout.tsx        # Root layout

assets/images/         # App icons and images
constants/             # Theme colors
.github/workflows/     # CI/CD
```

## Testing

Before submitting a PR:

- [ ] App builds successfully
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Tested on iOS simulator/device
- [ ] Barcode scanning works
- [ ] Notifications trigger correctly
- [ ] Expiration tracking is accurate

## Commit Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

### Examples

```bash
feat(scanner): add manual barcode entry fallback

Allow users to manually type barcodes when camera
scanning fails or barcode is damaged.

Closes #123

---

fix(notifications): correct timezone handling

Notifications were scheduling in UTC instead of
local timezone, causing alerts at wrong times.

Fixes #456

---

docs: add contributing guidelines

Added CONTRIBUTING.md with development setup
and PR process instructions.
```

## Code Style

- **TypeScript**: Use types, no `any` unless necessary
- **Formatting**: Consistent indentation (2 spaces)
- **Naming**: Descriptive, camelCase for variables, PascalCase for components
- **Comments**: Explain "why", not "what"
- **Imports**: Organize and remove unused
- **Components**: Keep focused, extract reusable parts

## Release Process

FridgeScout uses [Release Please](https://github.com/googleapis/release-please):

1. Commits to `main` with conventional messages
2. Release Please creates PR with version bump
3. Merge PR → GitHub release created
4. EAS workflow builds and submits to App Store

## Questions?

- 📧 Email: nicolepyzza@gmail.com
- 💬 [Open a discussion](https://github.com/nicolepyzza/fridgescout/discussions)
- 🐛 [Report an issue](https://github.com/nicolepyzza/fridgescout/issues)

---

Thank you for helping make FridgeScout better! 🙌

# 🥗 FridgeScout

[![App Store](https://img.shields.io/badge/App%20Store-Download-blue)](https://apps.apple.com/app/id6756861149)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Release Please](https://img.shields.io/badge/Release-Please-orange)](https://github.com/googleapis/release-please)

**Track food freshness, reduce waste, and never let groceries expire again!**

FridgeScout is your personal food waste prevention assistant. Scan barcodes, track expiration dates, and get timely reminders before your food goes bad - all while keeping your data 100% private on your device.

---

## ✨ Features

- 📷 **Barcode Scanning** - Instant product identification with automatic name lookup
- 📅 **Smart Expiration Tracking** - Default 30-day expiry with calendar picker
- 🔔 **Custom Reminders** - Set alerts days before items expire
- ⏱️ **Days-in-Fridge Counter** - Know exactly how long items have been stored
- 🎨 **Color-Coded Warnings** - Visual indicators for expiration status (green/yellow/orange/red)
- 🔒 **100% Private** - All data stays on your device, no tracking or analytics
- 🌙 **Dark Mode** - Beautiful teal and mint color scheme
- 📱 **iOS & iPad Support** - Optimized for all Apple devices

---

## 📸 Screenshots

[Add screenshots here from the App Store]

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v20+ (LTS recommended)
- **npm** or **yarn**
- **iOS Simulator** (Xcode required) or physical iOS device
- **Expo account** (free, for building)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nicolepyzza/fridgescout.git
   cd fridgescout
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npx expo start
   ```

4. **Run on iOS**
   ```bash
   npx expo run:ios
   ```

   Or press `i` in the Expo terminal to open iOS simulator.

---

## 🛠️ Development

### Project Structure

```
fridgescout/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Main home screen
│   │   └── _layout.tsx    # Tab layout config
│   └── _layout.tsx        # Root layout
├── assets/                # Images and fonts
│   └── images/
│       ├── icon.png       # App icon (1024x1024)
│       └── splash-icon.png
├── constants/             # Theme colors and config
├── .github/workflows/     # GitHub Actions CI/CD workflows
├── .github/dependabot.yml # Dependabot configuration
├── screenshots/           # App Store screenshots
└── app.json              # Expo configuration
```

### Tech Stack

- **Framework**: [Expo](https://expo.dev/) SDK 54 + React Native
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) v6
- **Language**: TypeScript
- **Storage**: AsyncStorage (local only)
- **Notifications**: expo-notifications
- **Camera**: expo-camera (barcode scanning)
- **Date Picker**: @react-native-community/datetimepicker
- **Product API**: [Open Food Facts](https://world.openfoodfacts.org/)

### Development Commands

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Type check
npx tsc --noEmit

# Lint
npx eslint .

# Build for production (requires EAS account)
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

---

## 🤝 Contributing

We love contributions! FridgeScout is open source and welcomes improvements from the community.

### Getting Started

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feat/amazing-feature
   ```

3. **Make your changes**
   - Follow existing code style
   - Write clear commit messages using [Conventional Commits](https://www.conventionalcommits.org/)
   - Add tests if applicable

4. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feat/amazing-feature
   ```

6. **Open a Pull Request**
   - Describe what you changed and why
   - Link any related issues
   - Screenshots for UI changes are appreciated!

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for automatic versioning:

- `feat:` - New features (minor version bump)
- `fix:` - Bug fixes (patch version bump)
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Build process or auxiliary tool changes

**Examples:**
```bash
git commit -m "feat: add OCR scanning for expiration dates"
git commit -m "fix: correct notification scheduling timezone issue"
git commit -m "docs: update installation instructions"
```

### Code Style

- Use **TypeScript** for type safety
- Follow existing patterns for state management
- Keep components focused and reusable
- Add comments for complex logic
- Use meaningful variable names

### Testing

Before submitting:
- [ ] App builds successfully (`npx expo run:ios`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Tested on iOS simulator/device
- [ ] Screenshots/barcode scanning works
- [ ] Notifications trigger correctly

---

## 🔄 Release Process

This project uses [Release Please](https://github.com/googleapis/release-please) for automated releases:

1. **Merge commits to `main`** with conventional commit messages
2. **Release Please** automatically creates a release PR with:
   - Updated version in `package.json`
   - Generated `CHANGELOG.md`
   - GitHub release notes
3. **Merge the release PR** to create a new GitHub release
4. **EAS Build workflow** automatically builds and submits to App Store

### Manual Release

```bash
# Build for App Store
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

---

## 🐛 Bug Reports & Feature Requests

Found a bug or have an idea? [Open an issue](https://github.com/nicolepyzza/fridgescout/issues/new)!

**Bug reports should include:**
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- iOS version and device model
- Screenshots/videos if applicable

**Feature requests should include:**
- Clear use case
- Why this feature would be valuable
- Any implementation ideas (optional)

---

## 📱 App Store

[Download FridgeScout on the App Store](https://apps.apple.com/app/id6756861149)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

Free to use, modify, and distribute. Attribution appreciated but not required!

---

## 🙏 Acknowledgments

- [Open Food Facts](https://world.openfoodfacts.org/) - Product database API
- [Expo](https://expo.dev/) - Development platform
- All our amazing contributors!

---

## 📧 Contact

**Nicole Pyzza**
- GitHub: [@nicolepyzza](https://github.com/nicolepyzza)
- Email: nicolepyzza@gmail.com

---

Made with ❤️ for reducing food waste 🌍

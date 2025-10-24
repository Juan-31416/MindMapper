# Release Management Guide

This document explains how to manage releases for MindMapper, including creating GitHub releases, managing version numbers, and following our release process.

## Table of Contents

- [Release Process Overview](#release-process-overview)
- [Version Numbering](#version-numbering)
- [Creating a Release](#creating-a-release)
- [GitHub Releases](#github-releases)
- [Automated Release Workflow](#automated-release-workflow)
- [Manual Release Process](#manual-release-process)
- [Release Checklist](#release-checklist)
- [Troubleshooting](#troubleshooting)

## Release Process Overview

Our release process follows these steps:

1. **Development** → Features developed in `feature/*` branches
2. **Integration** → Features merged into `develop` branch
3. **Release Preparation** → Create `release/vX.Y.Z` branch
4. **Testing** → Final testing and bug fixes
5. **Version Bump** → Update version numbers and changelog
6. **Merge to Main** → Merge release branch to `main`
7. **Tag Release** → Create Git tag for the version
8. **GitHub Release** → Create GitHub release with artifacts
9. **Deploy** → Release artifacts are automatically uploaded

## Version Numbering

We follow [Semantic Versioning](https://semver.org/) (SemVer):

### Format: `MAJOR.MINOR.PATCH`

- **MAJOR** (1.0.0): Breaking changes, incompatible API changes
- **MINOR** (0.1.0): New features, backwards-compatible additions
- **PATCH** (0.1.1): Bug fixes, backwards-compatible fixes

### Pre-release Versions

- **Alpha**: `0.1.0-alpha.1` - Early development, unstable
- **Beta**: `0.1.0-beta.1` - Feature complete, testing phase
- **Release Candidate**: `0.1.0-rc.1` - Final testing before release

### Examples

```bash
# Current stable release
v0.1.0

# Bug fix release
v0.1.1

# New feature release
v0.2.0

# Major version with breaking changes
v1.0.0

# Pre-release versions
v0.2.0-alpha.1
v0.2.0-beta.1
v0.2.0-rc.1
```

## Creating a Release

### Prerequisites

- Admin access to the repository
- Local development environment set up
- All tests passing
- Documentation updated

### Step-by-Step Process

#### 1. Prepare Release Branch

```bash
# Ensure develop is up to date
git checkout develop
git pull origin develop

# Create release branch
git checkout -b release/v0.1.0
git push origin release/v0.1.0
```

#### 2. Update Version Numbers

Update the version in `package.json`:

```json
{
  "version": "0.1.0"
}
```

#### 3. Update Changelog

Update `CHANGELOG.md`:

```markdown
## [0.1.0] - 2024-01-15

### Added
- Initial release with core mind mapping features
- Cross-platform support (Windows, macOS, Linux)
- Export to PDF and JSON formats
- Dark and light themes

### Fixed
- None in initial release

### Security
- Secure IPC communication
- Context isolation enabled
```

#### 4. Final Testing

```bash
# Build and test the application
npm run build
npm run package:linux
npm run package:win
npm run package:mac

# Test on your platform
./build/MindMapper-0.1.0.AppImage  # Linux
```

#### 5. Create Pull Request

Create a PR from `release/v0.1.0` to `main`:

- **Title**: `Release v0.1.0`
- **Description**: Include changelog content
- **Reviewers**: At least one team member
- **Labels**: `release`, `version-0.1.0`

#### 6. Merge and Tag

After PR approval:

```bash
# Switch to main branch
git checkout main
git pull origin main

# Merge release branch
git merge release/v0.1.0

# Create and push tag
git tag -a v0.1.0 -m "Release version 0.1.0"
git push origin main --tags
```

#### 7. Merge Back to Develop

```bash
# Switch to develop
git checkout develop
git pull origin develop

# Merge release branch
git merge release/v0.1.0
git push origin develop

# Clean up release branch
git branch -d release/v0.1.0
git push origin --delete release/v0.1.0
```

## GitHub Releases

### Automated Release Creation

When you push a tag, the GitHub Actions workflow automatically:

1. **Builds** the application for all platforms
2. **Packages** Windows, macOS, and Linux versions
3. **Extracts** changelog content
4. **Creates** GitHub release with:
   - Release notes from changelog
   - Download links for all platforms
   - Installation instructions

### Manual Release Creation

If you need to create a release manually:

1. Go to **Releases** page on GitHub
2. Click **Create a new release**
3. **Choose a tag**: Select `v0.1.0`
4. **Release title**: `Release v0.1.0`
5. **Description**: Copy content from changelog
6. **Attach binaries**: Upload build artifacts
7. **Publish release**

### Release Notes Template

```markdown
## What's New in v0.1.0

### ✨ New Features
- Initial release with core mind mapping functionality
- Cross-platform support (Windows, macOS, Linux)
- Export capabilities (PDF, JSON)
- Theme support (Light/Dark)

### 🐛 Bug Fixes
- None in initial release

### 🔒 Security
- Secure IPC communication between processes
- Context isolation enabled for security

## Downloads

### Linux
- **AppImage**: Universal Linux package
- **DEB**: Debian/Ubuntu package

### Windows
- **NSIS Installer**: Windows installer

### macOS
- **DMG**: macOS disk image

## Installation

1. Download the appropriate package for your OS
2. Follow platform-specific installation instructions
3. Launch MindMapper and start creating mind maps!

## Support

- 🐛 [Report Issues](https://github.com/yourusername/mindmapper/issues)
- 💡 [Request Features](https://github.com/yourusername/mindmapper/issues)
- 📖 [Documentation](https://github.com/yourusername/mindmapper/blob/main/README.md)
```

## Automated Release Workflow

The `.github/workflows/release.yml` workflow handles:

### Triggers

- **Tag Push**: Automatically triggered on `v*` tags
- **Manual**: Can be triggered manually with version input

### Build Process

1. **Setup**: Node.js environment and dependencies
2. **Build**: Compile TypeScript and bundle assets
3. **Package**: Create platform-specific packages
4. **Upload**: Store artifacts for release
5. **Release**: Create GitHub release with artifacts

### Supported Platforms

- **Linux**: AppImage and DEB packages
- **Windows**: NSIS installer
- **macOS**: DMG package

## Manual Release Process

If automated release fails or you need manual control:

### 1. Build Locally

```bash
# Install dependencies
npm ci

# Build application
npm run build

# Package for all platforms
npm run package:linux
npm run package:win
npm run package:mac
```

### 2. Create Release Manually

1. Go to GitHub Releases
2. Click "Create a new release"
3. Select tag `v0.1.0`
4. Add release notes
5. Upload build artifacts from `build/` directory
6. Publish release

### 3. Verify Release

- Download and test packages
- Verify installation on different platforms
- Check release notes formatting
- Ensure all artifacts are uploaded

## Release Checklist

### Pre-Release

- [ ] All features complete and tested
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version numbers updated
- [ ] Release branch created
- [ ] Final testing completed

### Release

- [ ] Pull request created and approved
- [ ] Release branch merged to main
- [ ] Git tag created and pushed
- [ ] GitHub release created
- [ ] Artifacts uploaded and verified
- [ ] Release notes published

### Post-Release

- [ ] Release branch merged back to develop
- [ ] Release branch deleted
- [ ] Announcement made (if applicable)
- [ ] Monitor for issues
- [ ] Update roadmap/planning

## Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist/ build/
npm run build
```

#### Tag Issues

```bash
# Delete local tag
git tag -d v0.1.0

# Delete remote tag
git push origin --delete v0.1.0

# Recreate tag
git tag -a v0.1.0 -m "Release version 0.1.0"
git push origin v0.1.0
```

#### Release Artifacts Missing

1. Check GitHub Actions logs
2. Verify build completed successfully
3. Manually upload artifacts if needed
4. Re-run workflow if necessary

### Getting Help

- Check GitHub Actions logs for build issues
- Review [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines
- Open an issue for release-related problems
- Contact maintainers for urgent issues

---

## Quick Reference

### Commands

```bash
# Create release branch
git checkout -b release/v0.1.0

# Update version
npm version 0.1.0

# Create tag
git tag -a v0.1.0 -m "Release version 0.1.0"

# Push tag (triggers automated release)
git push origin v0.1.0
```

### File Locations

- **Version**: `package.json`
- **Changelog**: `CHANGELOG.md`
- **Workflow**: `.github/workflows/release.yml`
- **Build Output**: `build/`
- **Releases**: GitHub Releases page

---

*This guide ensures consistent, professional releases for MindMapper. Follow these steps for every release to maintain quality and user experience.*

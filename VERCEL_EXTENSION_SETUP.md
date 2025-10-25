# Vercel Extension Installation Guide

## 🎯 VS Code Extension (Recommended)

### Install Vercel Extension for VS Code:
1. **Open VS Code**
2. **Go to Extensions** (Ctrl+Shift+X or Cmd+Shift+X)
3. **Search for**: `Vercel`
4. **Install**: "Vercel" by Vercel Inc.
5. **Alternative**: Install directly from [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Vercel.vercel-deployment-extension)

### Features:
- ✅ Monitor deployments directly in VS Code
- ✅ Manage projects and environments
- ✅ Inspect deployment artifacts
- ✅ View logs and performance metrics
- ✅ Deploy with one click

---

## 🌐 Browser Extension (For Web Management)

### Chrome Extension:
- **Install**: [Vercel Chrome Extension](https://chromewebstore.google.com/detail/vercel/lahhiofdgnbcgmemekkmjnpifojdaelb?hl=en)
- **Features**: Vercel Toolbar integration, screenshots for deployments

### Firefox Extension:
- **Install**: [Vercel Firefox Extension](https://addons.mozilla.org/en-US/firefox/addon/vercel/)
- **Features**: Same as Chrome extension

---

## 💻 Command Line Interface (CLI)

### Install Vercel CLI:
```bash
# Install globally
npm install -g vercel

# Or use npx (no installation needed)
npx vercel
```

### Basic Commands:
```bash
# Login to Vercel
vercel login

# Link project
vercel link

# Deploy
vercel --prod

# View logs
vercel logs

# List projects
vercel projects list
```

---

## 🔧 Quick Setup for Your SlangSupport Project

### 1. Install VS Code Extension (if using VS Code):
1. Open VS Code
2. Extensions → Search "Vercel" → Install
3. Sign in to Vercel when prompted

### 2. Install Vercel CLI:
```bash
npm install -g vercel
```

### 3. Login and Link:
```bash
cd /Users/lacbis/Downloads/slangsupport
vercel login
vercel link
```

### 4. Deploy:
```bash
vercel --prod
```

---

## 📊 Benefits of Using Extensions

### VS Code Extension:
- ✅ Deploy directly from editor
- ✅ View deployment status
- ✅ Access logs and metrics
- ✅ Manage environment variables
- ✅ Preview deployments

### Browser Extension:
- ✅ Enhanced Vercel dashboard experience
- ✅ Quick access to deployment tools
- ✅ Screenshot capabilities for feedback

### CLI:
- ✅ Full control over deployments
- ✅ Automation capabilities
- ✅ Script integration
- ✅ CI/CD pipeline support

---

## 🎯 Recommended Setup

1. **Install VS Code Extension** (for development workflow)
2. **Install Browser Extension** (for web management)
3. **Install CLI** (for advanced deployment control)

This gives you the complete Vercel toolkit for managing your SlangSupport deployment!

# 🚀 Deploy SlangSupport to Vercel

This guide will help you deploy your SlangSupport frontend to Vercel in just a few steps.

## Prerequisites

- ✅ SlangSupport project ready
- ✅ GitHub account
- ✅ Vercel account (free)

## Method 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Push to GitHub

1. **Initialize Git** (if not already done):
```bash
cd /Users/lacbis/Downloads/slangsupport
git init
git add .
git commit -m "Initial commit: SlangSupport with enhanced features"
```

2. **Create GitHub Repository**:
   - Go to [GitHub.com](https://github.com)
   - Click "New repository"
   - Name it `slangsupport` or `slangsupport-frontend`
   - Make it public
   - Don't initialize with README (we already have one)

3. **Push to GitHub**:
```bash
git remote add origin https://github.com/YOUR_USERNAME/slangsupport.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. **Go to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub

2. **Import Project**:
   - Click "New Project"
   - Import your GitHub repository
   - Select the `slangsupport` repository

3. **Configure Build Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Set Environment Variables**:
   - Click "Environment Variables"
   - Add: `VITE_API_URL` = `http://localhost:3002/api` (for now)
   - Add: `VITE_DEBUG` = `false`

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
cd /Users/lacbis/Downloads/slangsupport
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **What's your project's name?** → slangsupport
- **In which directory is your code located?** → ./

### Step 4: Set Environment Variables

```bash
vercel env add VITE_API_URL
# Enter: http://localhost:3001/api

vercel env add VITE_DEBUG
# Enter: false
```

### Step 5: Redeploy

```bash
vercel --prod
```

## Post-Deployment Configuration

### 1. Update Environment Variables

Once deployed, update your environment variables in Vercel dashboard:

1. Go to your project in Vercel
2. Settings → Environment Variables
3. Update `VITE_API_URL` to your production backend URL
4. Redeploy

### 2. Custom Domain (Optional)

1. Go to Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### 3. Enable Analytics (Optional)

1. Go to Settings → Analytics
2. Enable Vercel Analytics for usage insights

## Testing Your Deployment

1. **Visit your deployed URL**
2. **Test core features**:
   - Search for slang terms
   - Test voice input
   - Save favorites
   - Take quiz
   - Check mobile responsiveness

3. **Check console for errors**:
   - Open browser dev tools
   - Look for any JavaScript errors
   - Verify API calls are working

## Troubleshooting

### Build Failures

**Common Issues**:
- Missing dependencies → Check `package.json`
- TypeScript errors → Fix type issues
- Environment variables → Set required vars

**Solutions**:
```bash
# Check build locally first
npm run build

# Fix any errors, then redeploy
vercel --prod
```

### Runtime Errors

**API Connection Issues**:
- Check `VITE_API_URL` environment variable
- Ensure backend is deployed and accessible
- Check CORS settings on backend

**Missing Features**:
- Verify all components are imported correctly
- Check for missing dependencies
- Review browser console for errors

### Performance Issues

**Large Bundle Size**:
- Check if all dependencies are needed
- Consider code splitting
- Optimize images and assets

## Production Checklist

- [ ] ✅ Code pushed to GitHub
- [ ] ✅ Deployed to Vercel
- [ ] ✅ Environment variables set
- [ ] ✅ Build successful
- [ ] ✅ Core features working
- [ ] ✅ Mobile responsive
- [ ] ✅ No console errors
- [ ] ✅ Performance acceptable
- [ ] ✅ Custom domain (optional)
- [ ] ✅ Analytics enabled (optional)

## Next Steps

After successful deployment:

1. **Share your app** with friends and family
2. **Monitor usage** via Vercel Analytics
3. **Collect feedback** and iterate
4. **Deploy backend** (if needed)
5. **Set up monitoring** and error tracking

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review browser console errors
3. Test locally first
4. Check Vercel documentation
5. Contact support if needed

---

🎉 **Congratulations!** Your SlangSupport app is now live on Vercel!

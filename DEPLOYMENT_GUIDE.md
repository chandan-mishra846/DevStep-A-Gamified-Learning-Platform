# 🚀 Deployment Guide

This guide will help you deploy your Gamified College Learning App on **Render** (backend) and **Vercel** (frontend).

---

## 📋 Prerequisites

1. **GitHub Account** - Push your code to a GitHub repository
2. **MongoDB Atlas Account** - For cloud database ([mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))
3. **Render Account** - Sign up at [render.com](https://render.com)
4. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)

---

## 🗄️ Step 1: Setup MongoDB Atlas

1. **Create a MongoDB Atlas Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create a New Cluster**
   - Click "Build a Database"
   - Select "Free" tier (M0)
   - Choose a cloud provider and region
   - Click "Create Cluster"

3. **Setup Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create username and password (save these!)
   - Set "Database User Privileges" to "Read and write to any database"

4. **Setup Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm

5. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/gamified-learning?retryWrites=true&w=majority`

---

## 🔧 Step 2: Deploy Backend on Render

### 2.1 Push Code to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

### 2.2 Create Web Service on Render

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Connect your GitHub account
   - Select your repository
   - Click "Connect"

3. **Configure Service**
   - **Name:** `gamified-learning-backend` (or any name)
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

4. **Add Environment Variables**
   Click "Advanced" and add these environment variables:
   
   ```
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/gamified-learning?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
   NODE_ENV=production
   PORT=5000
   ```
   
   **Important:**
   - Replace `MONGO_URI` with your actual MongoDB Atlas connection string
   - Replace `JWT_SECRET` with a secure random string (at least 32 characters)

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes for first deployment)
   - Copy your backend URL: `https://gamified-learning-backend.onrender.com`

6. **Test Backend**
   - Visit your backend URL in a browser
   - You should see: "🚀 DevStep API is Running!"

---

## 🎨 Step 3: Deploy Frontend on Vercel

### 3.1 Update Frontend Configuration

The frontend needs to know where your backend is deployed. Create a `.env.production` file:

```bash
# In the frontend directory
cd frontend
```

Create `.env.production` file:
```env
VITE_API_URL=https://gamified-learning-backend.onrender.com
```

**Replace the URL with your actual Render backend URL**

### 3.2 Update API Calls (Already Done)

The code now uses `API_BASE_URL` from `src/config/api.js` which automatically reads from environment variables.

### 3.3 Deploy to Vercel

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (Select your account)
# - Link to existing project? No
# - Project name? (Press enter for default)
# - In which directory is your code located? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

**Option B: Using Vercel Dashboard**

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"

2. **Import Repository**
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
   - **Install Command:** `npm install` (default)

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add:
     ```
     Name: VITE_API_URL
     Value: https://gamified-learning-backend.onrender.com
     ```
   - Apply to: Production, Preview, and Development

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live at: `https://your-project-name.vercel.app`

---

## ✅ Step 4: Verify Deployment

### Test Backend

Visit your Render URL:
```
https://gamified-learning-backend.onrender.com/
```
You should see: "🚀 DevStep API is Running!"

### Test Frontend

1. Visit your Vercel URL
2. Try signing up with a new account
3. Try logging in
4. Check if all features work (quests, messages, mentorship)

---

## 🔍 Troubleshooting

### Backend Issues

**Problem:** MongoDB connection fails
- **Solution:** Check your MongoDB Atlas connection string
- Verify IP whitelist includes 0.0.0.0/0
- Check database user credentials

**Problem:** API returns 500 errors
- **Solution:** Check Render logs (Dashboard → Logs tab)
- Verify all environment variables are set correctly

**Problem:** Free tier Render spins down after inactivity
- **Solution:** Free tier sleeps after 15 minutes of inactivity
- First request after sleep takes 50+ seconds
- Consider upgrading to a paid tier for 24/7 uptime

### Frontend Issues

**Problem:** Cannot connect to backend
- **Solution:** Check `VITE_API_URL` environment variable in Vercel
- Verify backend is running
- Check browser console for CORS errors

**Problem:** Login/Signup not working
- **Solution:** Verify backend `/api/users/login` and `/api/users/register` endpoints work
- Check Network tab in browser DevTools
- Verify JWT_SECRET is set in backend

**Problem:** Changes not reflecting
- **Solution:** Redeploy on Vercel
- Clear browser cache
- Verify build completed successfully

---

## 🔄 Continuous Deployment

### Auto-Deploy on Git Push

Both Render and Vercel support automatic deployments:

**Render:**
- Automatically deploys when you push to your main branch
- Configure branch in Dashboard → Settings → Branch

**Vercel:**
- Automatically deploys on every push
- Main branch → Production
- Other branches → Preview deployments

---

## 📊 Monitoring

### Render Monitoring
- Dashboard → Your Service → Metrics
- View CPU, Memory, and Response times
- Check logs for errors

### Vercel Monitoring
- Dashboard → Your Project → Analytics
- View visitor stats and performance
- Check function logs

---

## 💰 Cost Considerations

### Free Tier Limits

**Render Free:**
- 750 hours/month (one service 24/7)
- Services spin down after 15 minutes of inactivity
- 512 MB RAM

**Vercel Free (Hobby):**
- Unlimited deployments
- 100 GB bandwidth/month
- Serverless functions

**MongoDB Atlas Free:**
- 512 MB storage
- Shared RAM
- No backups

---

## 🚀 Going to Production

When you're ready for production:

1. **Upgrade MongoDB Atlas** to a paid tier for backups and better performance
2. **Upgrade Render** to prevent service sleep ($7/month)
3. **Add Custom Domain** on Vercel
4. **Enable HTTPS** (Automatic on both platforms)
5. **Setup Monitoring** (Sentry, LogRocket, etc.)
6. **Add Error Tracking**
7. **Setup CI/CD** with GitHub Actions

---

## 📝 Important Notes

- Keep your `.env` files secret and never commit them to Git
- Always use strong passwords and JWT secrets
- Regularly update dependencies for security
- Monitor your usage to avoid unexpected charges
- Backup your database regularly

---

## 🆘 Need Help?

- **Render Docs:** [render.com/docs](https://render.com/docs)
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **MongoDB Atlas Docs:** [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

---

**Happy Deploying! 🎉**

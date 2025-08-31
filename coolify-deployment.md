# 🚀 Coolify Deployment Guide

**Deploy your TempMail app to Coolify in minutes!**

## 🎯 **What You'll Achieve:**

✅ **Your app running** on your VPS at `http://146.59.19.160`  
✅ **Real domain support** (when you add your domain)  
✅ **Professional deployment** with Coolify  
✅ **Easy updates** and scaling  
✅ **SSL certificates** automatically managed  

## 📋 **Prerequisites (Already Done!):**

✅ **Coolify installed** on your VPS  
✅ **VPS accessible** at `146.59.19.160:8000`  
✅ **Project builds** successfully locally  
✅ **GitHub repository** ready  

## 🚀 **Step 1: Access Coolify Dashboard**

1. **Open**: [http://146.59.19.160:8000](http://146.59.19.160:8000)
2. **Login** with:
   - **Email**: `moaj@jubair.com`
   - **Password**: `RiduBadsha1280#`

## 🔗 **Step 2: Connect GitHub (Recommended)**

### **2.1 Add GitHub Source**
1. **Click "Sources"** in Coolify
2. **Click "Add Source"**
3. **Select "GitHub"**
4. **Authorize** Coolify to access your GitHub
5. **Select repository**: `jubairmoaj/temp-mail-nextjs`

### **2.2 Configure Build Settings**
```yaml
# Build Command
npm run build

# Start Command
npm start

# Node.js Version
18.x (or latest LTS)

# Port
3000

# Environment Variables
NODE_ENV=production
PORT=3000
```

## 🐳 **Step 3: Deploy Application**

### **3.1 Create New Application**
1. **Click "Applications"** in Coolify
2. **Click "New Application"**
3. **Select your GitHub source**
4. **Choose branch**: `main`

### **3.2 Configure Application**
```yaml
# Application Name
temp-mail-nextjs

# Build Command
npm run build

# Start Command
npm start

# Port
3000

# Health Check Path
/

# Auto Deploy
✅ Enabled (deploy on every push)
```

### **3.3 Environment Variables**
Add these in Coolify dashboard:
```env
NODE_ENV=production
PORT=3000
# Add these when you set up MySQL:
# DB_HOST=localhost
# DB_USER=mailuser
# DB_PASSWORD=your_password
# DB_NAME=mailserver
```

## 🌐 **Step 4: Access Your App**

### **4.1 After Deployment**
Your app will be available at:
- **Main URL**: `http://146.59.19.160:3000` (or custom port)
- **Admin Panel**: `http://146.59.19.160:3000/admin-panel`
- **API Endpoints**: `http://146.59.19.160:3000/api/*`

### **4.2 Test Your App**
1. **Visit main page** - should see TempMail interface
2. **Go to admin panel** - password: `admin123`
3. **Test API endpoints** - should all work

## 🔧 **Step 5: Add Your Real Domain**

### **5.1 Domain Configuration**
1. **Purchase domain** (e.g., `mytempdomain.com`)
2. **Point DNS** to your VPS IP: `146.59.19.160`
3. **Add domain** in Coolify dashboard

### **5.2 DNS Records**
```
Type    Name    Value              Priority
A       @       146.59.19.160     -
A       www     146.59.19.160     -
CNAME   mail    @                  -
```

### **5.3 SSL Certificate**
Coolify will automatically:
- **Generate SSL certificate** for your domain
- **Enable HTTPS** access
- **Auto-renew** certificates

## 📧 **Step 6: Set Up Email Server**

### **6.1 Install Email Server on VPS**
Since Coolify is running on your VPS, you can install the email server alongside it:

```bash
# SSH to your VPS
ssh root@146.59.19.160

# Install email server components
apt update
apt install -y postfix dovecot-core dovecot-imapd mysql-server

# Configure email server (see REAL_DOMAIN_SETUP_GUIDE.md)
```

### **6.2 Connect to Email Server**
Update your app's environment variables in Coolify:
```env
DB_HOST=localhost
DB_USER=mailuser
DB_PASSWORD=your_secure_password
DB_NAME=mailserver
```

## 🎉 **What You'll Have After Deployment:**

✅ **Your app running** on your VPS  
✅ **Professional deployment** with Coolify  
✅ **Easy updates** (just push to GitHub)  
✅ **SSL certificates** automatically managed  
✅ **Real domain support** (when configured)  
✅ **Email server** running alongside your app  
✅ **Full admin panel** accessible publicly  

## 🚨 **Troubleshooting:**

### **Build Fails**
- **Check Node.js version** in Coolify (use 18.x)
- **Verify build command**: `npm run build`
- **Check environment variables**

### **App Won't Start**
- **Verify start command**: `npm start`
- **Check port configuration** (3000)
- **Review Coolify logs**

### **Domain Not Working**
- **Check DNS propagation** (can take 24-48 hours)
- **Verify DNS records** point to `146.59.19.160`
- **Check SSL certificate** generation

## 🔮 **Next Steps After Deployment:**

1. **Test your app** on the VPS
2. **Add your real domain** through admin panel
3. **Set up email server** for real email reception
4. **Configure SSL** for your domain
5. **Test real email** functionality

## 💰 **Cost Breakdown:**

- **VPS**: Already running Coolify
- **Domain**: $10-15/year
- **SSL**: Free (Coolify manages)
- **Total**: ~$1/month for domain

---

**Your TempMail app will be running on your VPS in minutes!** 🚀

Coolify makes deployment so much easier than manual setup. Once deployed, you'll have a professional email service running on your own infrastructure!

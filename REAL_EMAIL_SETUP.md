# 🚀 Real Email Setup Guide for TempMail

This guide will help you set up your temporary mail system to work with real domains and actually receive emails.

## 🌐 **Step 1: Domain Setup**

### **1.1 Purchase a Domain**
- Buy a domain from providers like:
  - **Namecheap** (recommended)
  - **GoDaddy**
  - **Google Domains**
  - **Cloudflare**

### **1.2 Configure DNS Records**

#### **MX Records (Mail Exchange)**
```
Type: MX
Name: @
Value: mail.yourdomain.com
Priority: 10
TTL: 3600
```

#### **A Records**
```
Type: A
Name: mail
Value: [Your Server IP Address]
TTL: 3600
```

#### **SPF Record (Sender Policy Framework)**
```
Type: TXT
Name: @
Value: v=spf1 a mx ~all
TTL: 3600
```

#### **DKIM Record (DomainKeys Identified Mail)**
```
Type: TXT
Name: default._domainkey
Value: v=DKIM1; k=rsa; p=[Your Public Key]
TTL: 3600
```

## 📧 **Step 2: Email Server Setup**

### **Option A: Self-Hosted Email Server (Advanced)**

#### **Requirements:**
- VPS or dedicated server
- Static IP address
- Reverse DNS (PTR record)
- Port 25, 587, 993, 995 open

#### **Installation (Ubuntu/Debian):**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Postfix (SMTP server)
sudo apt install postfix postfix-mysql dovecot-core dovecot-imapd dovecot-mysql

# Install additional packages
sudo apt install mailutils spamassassin clamav-daemon
```

#### **Postfix Configuration:**
```bash
# Edit main configuration
sudo nano /etc/postfix/main.cf

# Add these lines:
myhostname = mail.yourdomain.com
mydomain = yourdomain.com
myorigin = $mydomain
inet_interfaces = all
mydestination = $myhostname, localhost.$mydomain, localhost, $mydomain
```

#### **Dovecot Configuration:**
```bash
# Edit dovecot configuration
sudo nano /etc/dovecot/conf.d/10-mail.conf

# Set mail location:
mail_location = maildir:~/Maildir
```

### **Option B: Email Service Provider (Recommended)**

#### **Mailgun Setup:**
1. **Sign up at [mailgun.com](https://mailgun.com)**
2. **Add your domain**
3. **Verify domain ownership**
4. **Get API keys**

#### **SendGrid Setup:**
1. **Sign up at [sendgrid.com](https://sendgrid.com)**
2. **Verify your domain**
3. **Get API keys**

## 🔧 **Step 3: Update Your Application**

### **3.1 Environment Variables**
Create `.env.local` file:
```env
# Email Service Configuration
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=yourdomain.com
SENDGRID_API_KEY=your_sendgrid_api_key

# Database (for storing emails)
DATABASE_URL=your_database_connection_string

# Webhook Secret
WEBHOOK_SECRET=your_webhook_secret
```

### **3.2 Update API Routes**

#### **Enhanced Email Generation:**
```typescript
// pages/api/generate-email.ts
import { Mailgun } from 'mailgun.js'

const mailgun = new Mailgun(formData).client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
})

export default async function handler(req, res) {
  // Generate email with real domain
  const email = `${username}@${domain}`
  
  // Set up email forwarding rules
  await mailgun.routes.create({
    expression: `match_recipient("${email}")`,
    action: ['forward("${process.env.WEBHOOK_URL}")'],
    description: `Forward emails for ${email}`
  })
  
  res.json({ email, emailId })
}
```

#### **Enhanced Email Receiving:**
```typescript
// pages/api/receive-email.ts
import { verifyWebhook } from 'mailgun-js'

export default async function handler(req, res) {
  // Verify webhook signature
  const isValid = verifyWebhook(
    req.body,
    req.headers['x-mailgun-signature'],
    process.env.MAILGUN_API_KEY
  )
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' })
  }
  
  // Process received email
  const { recipient, sender, subject, body } = req.body
  
  // Store in database
  await storeEmail(recipient, sender, subject, body)
  
  res.json({ success: true })
}
```

### **3.3 Database Integration**

#### **Install Prisma:**
```bash
npm install prisma @prisma/client
npx prisma init
```

#### **Database Schema:**
```prisma
// prisma/schema.prisma
model Email {
  id        String   @id @default(cuid())
  email     String   @unique
  domain    String
  createdAt DateTime @default(now())
  messages  Message[]
}

model Message {
  id        String   @id @default(cuid())
  emailId   String
  from      String
  subject   String
  body      String
  html      String?
  timestamp DateTime @default(now())
  email     Email    @relation(fields: [emailId], references: [id])
}
```

## 🚀 **Step 4: Deployment Updates**

### **4.1 Vercel Environment Variables**
1. Go to Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all your environment variables

### **4.2 Update Vercel Configuration**
```json
// vercel.json
{
  "functions": {
    "pages/api/receive-email.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "MAILGUN_API_KEY": "@mailgun_api_key",
    "DATABASE_URL": "@database_url"
  }
}
```

## 🔍 **Step 5: Testing**

### **5.1 Test Email Generation**
```bash
curl -X POST https://yourdomain.com/api/generate-email \
  -H "Content-Type: application/json" \
  -d '{"domain": "yourdomain.com"}'
```

### **5.2 Test Email Receiving**
Send an email to the generated address and check if it appears in your inbox.

### **5.3 Monitor Logs**
Check Vercel function logs and your email server logs for any issues.

## 🛡️ **Security Considerations**

### **Rate Limiting:**
```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
```

### **Webhook Verification:**
Always verify webhook signatures to prevent spam and abuse.

### **Email Validation:**
Implement proper email validation and sanitization.

## 💰 **Cost Considerations**

### **Domain:**
- **Domain registration**: $10-15/year
- **DNS management**: Usually free with domain

### **Email Server:**
- **Self-hosted**: $5-20/month for VPS
- **Mailgun**: $35/month for 50,000 emails
- **SendGrid**: $14.95/month for 50,000 emails

### **Database:**
- **PostgreSQL on Vercel**: Free tier available
- **MongoDB Atlas**: Free tier available

## 🎯 **Recommended Setup for Beginners**

1. **Start with Mailgun** (easier setup)
2. **Use a simple domain** (like `tempmail.yourdomain.com`)
3. **Implement basic email forwarding**
4. **Add database storage**
5. **Scale up gradually**

## 🔗 **Useful Resources**

- [Mailgun Documentation](https://documentation.mailgun.com/)
- [SendGrid Documentation](https://sendgrid.com/docs/)
- [Postfix Documentation](https://www.postfix.org/documentation.html)
- [Dovecot Documentation](https://doc.dovecot.org/)

## 🚨 **Common Issues & Solutions**

### **Emails not being received:**
- Check DNS records
- Verify email server configuration
- Check firewall settings
- Monitor server logs

### **Webhook not working:**
- Verify webhook URL
- Check signature verification
- Monitor Vercel function logs
- Test with webhook testing tools

---

**Need help?** Check the logs, verify configurations, and test step by step!

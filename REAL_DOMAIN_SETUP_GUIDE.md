# 🚀 Real Domain Email Setup Guide

Complete guide to set up your own domain with a real email server to receive actual emails.

## 🎯 **What You'll Achieve:**

✅ **Real domain** (e.g., `mytempdomain.com`)  
✅ **Actual email reception** (not simulated)  
✅ **Professional email server** (Postfix + Dovecot)  
✅ **SSL security** (Let's Encrypt certificates)  
✅ **Multiple domain support**  
✅ **Full control** over your email system  

## 📋 **Prerequisites:**

1. **Domain name** (purchased from registrar)
2. **VPS provider account** (DigitalOcean, Linode, Vultr)
3. **Basic Linux knowledge** (or willingness to learn)
4. **Credit card** for VPS payment ($5-20/month)

## 🚀 **Step 1: Choose Your VPS Provider**

### **Recommended: DigitalOcean**
- **Droplet**: $5/month (1GB RAM, 1 CPU, 25GB SSD)
- **Easy setup** for beginners
- **Good documentation** and community
- **Reliable service**

### **Alternative: Linode**
- **Nanode**: $5/month (1GB RAM, 1 CPU, 25GB SSD)
- **Excellent performance**
- **Good for email servers**

### **Budget Option: Vultr**
- **Cloud Compute**: $3.50/month (512MB RAM, 1 CPU, 10GB SSD)
- **Very affordable**
- **May need more RAM for email server**

## 🌐 **Step 2: Domain Setup**

### **2.1 Purchase Domain (if needed)**
- **GoDaddy, Namecheap, or Google Domains**
- **Cost**: $10-15/year
- **Choose a memorable name** (e.g., `mytempdomain.com`)

### **2.2 DNS Configuration**
Once you have your VPS IP address, you'll set these DNS records:

```
Type    Name    Value                    Priority
A       @       YOUR_VPS_IP_ADDRESS     -
A       mail    YOUR_VPS_IP_ADDRESS     -
MX      @       mail.YOURDOMAIN.COM     10
TXT     @       v=spf1 mx a ~all       -
TXT     default._domainkey v=DKIM1...  -
```

## 🖥️ **Step 3: VPS Setup**

### **3.1 Create VPS Instance**
1. **Choose Ubuntu 22.04 LTS**
2. **Select $5-10/month plan** (minimum 1GB RAM)
3. **Choose datacenter** close to your users
4. **Add SSH key** for secure access

### **3.2 Initial Server Setup**
```bash
# Connect to your VPS
ssh root@YOUR_VPS_IP

# Update system
apt update && apt upgrade -y

# Install essential packages
apt install -y curl wget git ufw fail2ban
```

### **3.3 Basic Security**
```bash
# Configure firewall
ufw allow ssh
ufw allow 25    # SMTP
ufw allow 465   # SMTPS
ufw allow 587   # Submission
ufw allow 993   # IMAPS
ufw allow 995   # POP3S
ufw allow 80    # HTTP (for SSL)
ufw allow 443   # HTTPS
ufw enable

# Configure fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

## 📧 **Step 4: Email Server Installation**

### **4.1 Install Postfix (SMTP Server)**
```bash
# Install Postfix
apt install -y postfix postfix-mysql

# Choose "Internet Site" during installation
# Set your domain as mail name
```

### **4.2 Install Dovecot (IMAP/POP3 Server)**
```bash
# Install Dovecot
apt install -y dovecot-core dovecot-imapd dovecot-pop3d dovecot-mysql
```

### **4.3 Install MySQL Database**
```bash
# Install MySQL
apt install -y mysql-server

# Secure installation
mysql_secure_installation

# Create database and user
mysql -u root -p
```

```sql
CREATE DATABASE mailserver;
CREATE USER 'mailuser'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON mailserver.* TO 'mailuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### **4.4 Import Database Schema**
```bash
# Import the schema we created earlier
mysql -u root -p mailserver < database-schema.sql
```

## 🔐 **Step 5: SSL Certificate Setup**

### **5.1 Install Certbot**
```bash
# Install Certbot
apt install -y certbot

# Get SSL certificate
certbot certonly --standalone -d YOURDOMAIN.COM -d mail.YOURDOMAIN.COM
```

### **5.2 Auto-renewal**
```bash
# Test auto-renewal
certbot renew --dry-run

# Add to crontab
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

## ⚙️ **Step 6: Email Server Configuration**

### **6.1 Postfix Configuration**
```bash
# Edit main configuration
nano /etc/postfix/main.cf

# Add these lines:
myhostname = mail.YOURDOMAIN.COM
mydomain = YOURDOMAIN.COM
myorigin = $mydomain
inet_interfaces = all
mydestination = $myhostname, localhost.$mydomain, localhost, $mydomain
mynetworks = 127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
home_mailbox = Maildir/
virtual_mailbox_domains = mysql:/etc/postfix/mysql-virtual-mailbox-domains.cf
virtual_mailbox_maps = mysql:/etc/postfix/mysql-virtual-mailbox-maps.cf
virtual_alias_maps = mysql:/etc/postfix/mysql-virtual-alias-maps.cf
smtpd_tls_cert_file = /etc/letsencrypt/live/YOURDOMAIN.COM/fullchain.pem
smtpd_tls_key_file = /etc/letsencrypt/live/YOURDOMAIN.COM/privkey.pem
smtpd_use_tls = yes
smtpd_tls_auth_only = yes
```

### **6.2 Dovecot Configuration**
```bash
# Edit main configuration
nano /etc/dovecot/conf.d/10-mail.conf

# Set mail location
mail_location = maildir:~/Maildir

# Edit SSL configuration
nano /etc/dovecot/conf.d/10-ssl.conf

# Set SSL paths
ssl_cert = </etc/letsencrypt/live/YOURDOMAIN.COM/fullchain.pem
ssl_key = </etc/letsencrypt/live/YOURDOMAIN.COM/privkey.pem
```

## 🚀 **Step 7: Deploy Your Next.js App**

### **7.1 Install Node.js**
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Verify installation
node --version
npm --version
```

### **7.2 Deploy Application**
```bash
# Clone your repository
git clone https://github.com/jubairmoaj/temp-mail-nextjs.git
cd temp-mail-nextjs

# Install dependencies
npm install

# Build the application
npm run build

# Install PM2 for process management
npm install -g pm2

# Start the application
pm2 start npm --name "temp-mail" -- start
pm2 startup
pm2 save
```

### **7.3 Environment Variables**
```bash
# Create environment file
nano .env.local

# Add these variables:
DB_HOST=localhost
DB_USER=mailuser
DB_PASSWORD=your_secure_password
DB_NAME=mailserver
NODE_ENV=production
PORT=3000
```

## 🌐 **Step 8: Nginx Reverse Proxy**

### **8.1 Install Nginx**
```bash
apt install -y nginx

# Create site configuration
nano /etc/nginx/sites-available/temp-mail
```

### **8.2 Nginx Configuration**
```nginx
server {
    listen 80;
    server_name YOURDOMAIN.COM www.YOURDOMAIN.COM;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name YOURDOMAIN.COM www.YOURDOMAIN.COM;

    ssl_certificate /etc/letsencrypt/live/YOURDOMAIN.COM/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/YOURDOMAIN.COM/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### **8.3 Enable Site**
```bash
# Enable site
ln -s /etc/nginx/sites-available/temp-mail /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

## 🧪 **Step 9: Testing**

### **9.1 Test Email Server**
```bash
# Test SMTP
telnet YOURDOMAIN.COM 25

# Test IMAP
telnet YOURDOMAIN.COM 993
```

### **9.2 Test Your Application**
1. **Visit your domain**: `https://YOURDOMAIN.COM`
2. **Go to admin panel**: `https://YOURDOMAIN.COM/admin-panel`
3. **Add your real domain** through admin panel
4. **Generate test email** with your domain
5. **Send test email** to the generated address

## 📊 **Step 10: Monitoring & Maintenance**

### **10.1 Email Logs**
```bash
# Check Postfix logs
tail -f /var/log/mail.log

# Check Dovecot logs
tail -f /var/log/dovecot.log
```

### **10.2 Application Logs**
```bash
# Check PM2 logs
pm2 logs temp-mail

# Check Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### **10.3 Regular Maintenance**
```bash
# Update system weekly
apt update && apt upgrade -y

# Check SSL certificate renewal
certbot renew --dry-run

# Monitor disk space
df -h

# Monitor memory usage
free -h
```

## 💰 **Cost Breakdown:**

- **VPS**: $5-10/month
- **Domain**: $10-15/year
- **SSL Certificate**: Free
- **Total**: ~$6-11/month

## 🚨 **Common Issues & Solutions:**

### **Issue: Emails not being received**
- **Check firewall**: Ensure ports 25, 465, 587, 993, 995 are open
- **Check DNS**: Verify MX and A records are correct
- **Check logs**: Review Postfix and Dovecot logs

### **Issue: SSL certificate errors**
- **Check domain**: Ensure domain points to correct IP
- **Check Certbot**: Verify certificate was issued correctly
- **Check Nginx**: Ensure SSL configuration is correct

### **Issue: Application not starting**
- **Check Node.js**: Verify correct version is installed
- **Check PM2**: Ensure process is running
- **Check logs**: Review application error logs

## 🎉 **Success Indicators:**

✅ **Domain resolves** to your VPS IP  
✅ **SSL certificate** is valid  
✅ **Email server** accepts connections  
✅ **Your app** is accessible via domain  
✅ **Admin panel** works with real domain  
✅ **Emails are received** and stored  
✅ **Web interface** shows real emails  

## 🔮 **Next Steps After Setup:**

1. **Add more domains** through admin panel
2. **Configure email forwarding** rules
3. **Set up spam filtering** (SpamAssassin)
4. **Implement backup** strategy
5. **Monitor performance** and scale as needed

---

**Your real email system will be fully functional!** 🚀📧

Once completed, you'll have a professional email server that can receive real emails on your domain, just like major email providers!

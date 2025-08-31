# 🖥️ Multi-Domain Self-Hosted Email Server Setup

Complete guide to set up your own email server that can handle multiple domains on a VPS.

## 🎯 **What You'll Build:**

- **Email server** handling multiple domains
- **Web interface** for email management
- **API endpoints** for your Next.js app
- **Database** for storing emails
- **Security features** (SPF, DKIM, DMARC)

## 🖥️ **Step 1: VPS Setup**

### **1.1 Choose VPS Provider**
```
Recommended: DigitalOcean ($12/month)
- 2 CPU cores
- 4GB RAM
- 80GB SSD
- 4TB bandwidth
- Static IP included
```

### **1.2 Server Requirements**
- **OS**: Ubuntu 22.04 LTS (recommended)
- **Static IP**: Required for email delivery
- **Reverse DNS**: Must match your domain
- **Open Ports**: 25, 587, 993, 995, 80, 443

### **1.3 Initial Server Setup**
```bash
# Connect to your VPS
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install essential packages
apt install -y curl wget git nano htop ufw fail2ban
```

## 🌐 **Step 2: Domain Configuration**

### **2.1 DNS Records for Each Domain**

#### **Domain 1: tempmail.com**
```
Type: MX
Name: @
Value: mail.tempmail.com
Priority: 10

Type: A
Name: mail
Value: [Your VPS IP]
TTL: 3600

Type: TXT
Name: @
Value: v=spf1 a mx ~all

Type: TXT
Name: default._domainkey
Value: v=DKIM1; k=rsa; p=[Your DKIM Key]
```

#### **Domain 2: 10minutemail.com**
```
Type: MX
Name: @
Value: mail.10minutemail.com
Priority: 10

Type: A
Name: mail
Value: [Your VPS IP]
TTL: 3600

Type: TXT
Name: @
Value: v=spf1 a mx ~all

Type: TXT
Name: default._domainkey
Value: v=DKIM1; k=rsa; p=[Your DKIM Key]
```

#### **Domain 3: guerrillamail.com**
```
Type: MX
Name: @
Value: mail.guerrillamail.com
Priority: 10

Type: A
Name: mail
Value: [Your VPS IP]
TTL: 3600

Type: TXT
Name: @
Value: v=spf1 a mx ~all

Type: TXT
Name: default._domainkey
Value: v=DKIM1; k=rsa; p=[Your DKIM Key]
```

## 📧 **Step 3: Email Server Installation**

### **3.1 Install Postfix (SMTP Server)**
```bash
# Install Postfix
apt install -y postfix postfix-mysql postfix-pcre

# Choose "Internet Site" during installation
# Set system mail name to your primary domain
```

### **3.2 Install Dovecot (IMAP/POP3 Server)**
```bash
# Install Dovecot
apt install -y dovecot-core dovecot-imapd dovecot-pop3d dovecot-mysql

# Install additional packages
apt install -y mailutils spamassassin clamav-daemon
```

### **3.3 Install Database (MySQL/MariaDB)**
```bash
# Install MariaDB
apt install -y mariadb-server mariadb-client

# Secure installation
mysql_secure_installation
```

## ⚙️ **Step 4: Configuration Files**

### **4.1 Postfix Main Configuration**
```bash
# Edit main configuration
nano /etc/postfix/main.cf

# Add these lines:
# Basic Settings
myhostname = mail.tempmail.com
mydomain = tempmail.com
myorigin = $mydomain
inet_interfaces = all
mydestination = $myhostname, localhost.$mydomain, localhost, $mydomain

# Virtual Domains
virtual_mailbox_domains = tempmail.com, 10minutemail.com, guerrillamail.com
virtual_mailbox_base = /var/mail/vhosts
virtual_mailbox_maps = mysql:/etc/postfix/mysql-virtual-mailbox-maps.cf
virtual_alias_maps = mysql:/etc/postfix/mysql-virtual-alias-maps.cf
virtual_uid_maps = static:5000
virtual_gid_maps = static:5000

# Security Settings
smtpd_helo_required = yes
smtpd_helo_restrictions = permit_mynetworks, reject_invalid_helo_hostname, reject_non_fqdn_helo_hostname
smtpd_recipient_restrictions = permit_mynetworks, reject_unauth_destination, reject_invalid_hostname, reject_non_fqdn_hostname, reject_non_fqdn_sender, reject_non_fqdn_recipient, reject_unknown_sender_domain, reject_unknown_recipient_domain, reject_rbl_client zen.spamhaus.org, reject_rbl_client bl.spamcop.net

# TLS Settings
smtpd_tls_cert_file = /etc/letsencrypt/live/mail.tempmail.com/fullchain.pem
smtpd_tls_key_file = /etc/letsencrypt/live/mail.tempmail.com/privkey.pem
smtpd_use_tls = yes
smtpd_tls_auth_only = yes
smtpd_tls_security_level = may
```

### **4.2 MySQL Configuration for Postfix**
```bash
# Create file: /etc/postfix/mysql-virtual-mailbox-maps.cf
nano /etc/postfix/mysql-virtual-mailbox-maps.cf

# Add content:
user = postfix
password = your_secure_password
hosts = 127.0.0.1
dbname = mailserver
query = SELECT 1 FROM virtual_users WHERE email='%s' AND active = 1
```

```bash
# Create file: /etc/postfix/mysql-virtual-alias-maps.cf
nano /etc/postfix/mysql-virtual-alias-maps.cf

# Add content:
user = postfix
password = your_secure_password
hosts = 127.0.0.1
dbname = mailserver
query = SELECT destination FROM virtual_aliases WHERE source='%s' AND active = 1
```

### **4.3 Dovecot Configuration**
```bash
# Edit main configuration
nano /etc/dovecot/conf.d/10-mail.conf

# Set mail location:
mail_location = maildir:~/Maildir

# Virtual users
mail_uid = 5000
mail_gid = 5000
first_valid_uid = 5000
last_valid_uid = 5000
```

```bash
# Edit authentication configuration
nano /etc/dovecot/conf.d/10-auth.conf

# Enable MySQL authentication
disable_plaintext_auth = yes
auth_mechanisms = plain login

# MySQL configuration
passdb {
  driver = sql
  args = /etc/dovecot/dovecot-sql.conf.ext
}

userdb {
  driver = static
  args = uid=5000 gid=5000 home=/var/mail/vhosts/%d/%n mail=maildir:~/Maildir
}
```

## 🗄️ **Step 5: Database Setup**

### **5.1 Create Database Schema**
```sql
-- Connect to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE mailserver;
USE mailserver;

-- Create virtual domains table
CREATE TABLE virtual_domains (
  id int(11) NOT NULL auto_increment,
  name varchar(50) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create virtual users table
CREATE TABLE virtual_users (
  id int(11) NOT NULL auto_increment,
  domain_id int(11) NOT NULL,
  email varchar(100) NOT NULL,
  password varchar(150) NOT NULL,
  active tinyint(1) NOT NULL DEFAULT 1,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email),
  FOREIGN KEY (domain_id) REFERENCES virtual_domains(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create virtual aliases table
CREATE TABLE virtual_aliases (
  id int(11) NOT NULL auto_increment,
  domain_id int(11) NOT NULL,
  source varchar(100) NOT NULL,
  destination varchar(100) NOT NULL,
  active tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  FOREIGN KEY (domain_id) REFERENCES virtual_domains(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Insert your domains
INSERT INTO virtual_domains (name) VALUES 
  ('tempmail.com'),
  ('10minutemail.com'),
  ('guerrillamail.com');

-- Create postfix user
CREATE USER 'postfix'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT SELECT ON mailserver.* TO 'postfix'@'localhost';
FLUSH PRIVILEGES;
```

## 🔐 **Step 6: SSL Certificate Setup**

### **6.1 Install Certbot**
```bash
# Install Certbot
apt install -y certbot

# Get SSL certificate for mail subdomain
certbot certonly --standalone -d mail.tempmail.com -d mail.10minutemail.com -d mail.guerrillamail.com

# Auto-renewal
crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🌐 **Step 7: Web Interface Setup**

### **7.1 Install Nginx**
```bash
# Install Nginx
apt install -y nginx

# Create configuration
nano /etc/nginx/sites-available/mailserver
```

### **7.2 Nginx Configuration**
```nginx
server {
    listen 80;
    server_name mail.tempmail.com mail.10minutemail.com mail.guerrillamail.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mail.tempmail.com mail.10minutemail.com mail.guerrillamail.com;

    ssl_certificate /etc/letsencrypt/live/mail.tempmail.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mail.tempmail.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

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

### **7.3 Enable Site**
```bash
# Enable site
ln -s /etc/nginx/sites-available/mailserver /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

## 🚀 **Step 8: Deploy Your Next.js App**

### **8.1 Install Node.js**
```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2
```

### **8.2 Clone and Deploy App**
```bash
# Clone your repository
cd /var/www
git clone https://github.com/jubairmoaj/temp-mail-nextjs.git
cd temp-mail-nextjs

# Install dependencies
npm install

# Build the app
npm run build

# Start with PM2
pm2 start npm --name "temp-mail" -- start
pm2 startup
pm2 save
```

## 🔧 **Step 9: Update Your App for Real Email**

### **9.1 Environment Variables**
```bash
# Create .env.local
nano .env.local

# Add:
DATABASE_URL=mysql://root:password@localhost/mailserver
MAIL_SERVER_HOST=localhost
MAIL_SERVER_PORT=25
DOMAINS=tempmail.com,10minutemail.com,guerrillamail.com
```

### **9.2 Update API Routes**
You'll need to modify your existing API routes to:
- Connect to the MySQL database
- Use real email server instead of in-memory storage
- Handle actual email delivery

## 🧪 **Step 10: Testing**

### **10.1 Test Email Server**
```bash
# Test SMTP
telnet mail.tempmail.com 25

# Test IMAP
telnet mail.tempmail.com 993

# Test from another server
echo "Subject: Test" | sendmail test@tempmail.com
```

### **10.2 Test Your Web App**
- Visit `https://mail.tempmail.com`
- Generate a temporary email
- Send an email to that address
- Check if it appears in your inbox

## 🛡️ **Security Considerations**

### **Firewall Setup**
```bash
# Configure UFW
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 25
ufw allow 587
ufw allow 993
ufw allow 995
ufw allow 80
ufw allow 443
ufw enable
```

### **Fail2ban Configuration**
```bash
# Install and configure Fail2ban
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

## 💰 **Cost Breakdown**

### **Monthly Costs:**
- **VPS**: $12-24/month
- **Domain registrations**: $1-2/month per domain
- **SSL certificates**: Free (Let's Encrypt)
- **Total**: $15-30/month

### **One-time Costs:**
- **Domain purchases**: $10-15 per domain
- **Setup time**: 4-8 hours

## 🎯 **Benefits of Self-Hosted:**

✅ **Full control** over email server  
✅ **Multiple domains** on one server  
✅ **No monthly email limits**  
✅ **Custom email policies**  
✅ **Data privacy**  
✅ **Professional setup**  

## 🚨 **Challenges:**

❌ **Complex setup** (4-8 hours)  
❌ **Server maintenance** required  
❌ **Security responsibility**  
❌ **Deliverability management**  
❌ **Backup and monitoring**  

## 🔄 **Next Steps:**

1. **Choose VPS provider** and create server
2. **Follow this guide** step by step
3. **Test each component** before moving to next
4. **Deploy your Next.js app** on the VPS
5. **Configure monitoring** and backups

---

**Ready to build your own email empire?** 🚀📧

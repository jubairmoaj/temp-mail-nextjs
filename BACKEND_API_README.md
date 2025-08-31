# 🚀 TempMail Backend API Documentation

Complete backend system for managing multiple domains and generating temporary emails.

## 📋 **API Endpoints Overview**

### **🔐 Admin Endpoints**
- `POST /api/admin/add-domain` - Add new domain
- `GET /api/admin/list-domains` - List all domains
- `PUT /api/admin/toggle-domain` - Enable/disable domain

### **📧 Email Management**
- `POST /api/generate-temp-email` - Generate temporary email
- `GET /api/list-temp-emails` - List all temporary emails
- `GET /api/emails/[emailId]` - Get email details
- `DELETE /api/emails/[emailId]` - Delete email

### **🌐 Domain Management**
- `GET /api/domains` - Get available domains
- `POST /api/real-email-generation` - Generate with custom domain
- `POST /api/real-email-setup` - Setup guide

## 🗄️ **Database Schema**

### **Core Tables**
- **`virtual_domains`** - Email domains
- **`virtual_users`** - Temporary email accounts
- **`messages`** - Received emails
- **`attachments`** - Email attachments
- **`audit_log`** - System activity log

### **Supporting Tables**
- **`domain_settings`** - Domain configuration
- **`user_sessions`** - Web interface sessions
- **`virtual_aliases`** - Email forwarding rules

## 🔧 **Setup Instructions**

### **1. Install Dependencies**
```bash
npm install mysql2 uuid
```

### **2. Environment Variables**
Create `.env.local`:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=webapp
DB_PASSWORD=your_webapp_password
DB_NAME=mailserver

# Server Configuration
NODE_ENV=production
PORT=3000
```

### **3. Database Setup**
```bash
# Connect to MySQL
mysql -u root -p

# Run the schema
source database-schema.sql
```

## 📡 **API Endpoints Details**

### **🔐 Admin: Add Domain**
```http
POST /api/admin/add-domain
Content-Type: application/json

{
  "domain": "mytempdomain.com",
  "description": "My custom temporary email domain",
  "active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Domain mytempdomain.com added successfully",
  "domain": {
    "id": 9,
    "name": "mytempdomain.com",
    "active": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### **🔐 Admin: List Domains**
```http
GET /api/admin/list-domains
```

**Response:**
```json
{
  "success": true,
  "domains": [
    {
      "id": 1,
      "name": "tempmail.com",
      "description": "Primary temporary email domain",
      "active": true,
      "emailCount": 150,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 8
}
```

### **🔐 Admin: Toggle Domain**
```http
PUT /api/admin/toggle-domain
Content-Type: application/json

{
  "domainId": 1,
  "active": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Domain tempmail.com disabled successfully",
  "domain": {
    "id": 1,
    "name": "tempmail.com",
    "active": false
  }
}
```

### **📧 Generate Temporary Email**
```http
POST /api/generate-temp-email
Content-Type: application/json

{
  "domain": "tempmail.com",
  "customUsername": "myuser",
  "expiresIn": 48
}
```

**Response:**
```json
{
  "success": true,
  "email": "myuser@tempmail.com",
  "emailId": "uuid-here",
  "domain": "tempmail.com",
  "username": "myuser",
  "expiresAt": "2024-01-03T00:00:00.000Z",
  "message": "Temporary email myuser@tempmail.com created successfully! Expires in 48 hours."
}
```

### **📧 List Temporary Emails**
```http
GET /api/list-temp-emails?domain=tempmail.com&active=true&limit=20&offset=0
```

**Response:**
```json
{
  "success": true,
  "emails": [
    {
      "id": 1,
      "email": "user123@tempmail.com",
      "domain": "tempmail.com",
      "username": "user123",
      "active": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "expiresAt": "2024-01-02T00:00:00.000Z",
      "messageCount": 5,
      "isExpired": false
    }
  ],
  "total": 150,
  "activeCount": 120,
  "expiredCount": 30
}
```

## 🛡️ **Security Features**

### **Input Validation**
- Domain format validation
- SQL injection prevention
- XSS protection

### **Access Control**
- Admin-only endpoints
- Session management
- Rate limiting (implement in production)

### **Data Protection**
- Password hashing
- Secure database connections
- Audit logging

## 🔄 **Workflow Examples**

### **Adding a New Domain**
1. **Admin adds domain** via `/api/admin/add-domain`
2. **Domain is active** and available for email generation
3. **Users can generate emails** with the new domain
4. **Emails are stored** in the database
5. **Automatic cleanup** removes expired emails

### **Generating Temporary Email**
1. **User requests email** via `/api/generate-temp-email`
2. **System validates domain** availability
3. **Creates virtual user** in database
4. **Sets up mail directory** structure
5. **Returns email details** to user

### **Email Lifecycle**
1. **Email created** with expiration time
2. **User receives emails** at the address
3. **Messages stored** in database
4. **Email expires** after set time
5. **System cleanup** deactivates expired emails

## 📊 **Database Views**

### **Active Emails View**
```sql
SELECT * FROM active_emails;
```
Shows all active emails with message counts and expiration status.

### **Domain Statistics View**
```sql
SELECT * FROM domain_stats;
```
Shows statistics for each domain including email counts and message totals.

## 🧹 **Maintenance Procedures**

### **Automatic Cleanup**
- **Event**: `cleanup_expired_emails` runs every hour
- **Procedure**: `CleanupExpiredEmails()` marks expired emails as inactive
- **Logging**: All cleanup actions are logged in audit_log

### **Manual Cleanup**
```sql
-- Mark expired emails as inactive
UPDATE virtual_users 
SET active = 0 
WHERE expires_at < NOW() AND active = 1;

-- Delete old audit logs (older than 30 days)
DELETE FROM audit_log 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

## 🚨 **Error Handling**

### **Common Error Responses**
```json
{
  "success": false,
  "error": "Domain not found"
}
```

### **HTTP Status Codes**
- **200**: Success
- **400**: Bad Request (validation errors)
- **404**: Not Found
- **405**: Method Not Allowed
- **500**: Internal Server Error

## 🔍 **Monitoring & Logging**

### **Audit Log Table**
Tracks all system activities:
- User actions
- Domain changes
- Email operations
- System events

### **Performance Monitoring**
- Database query performance
- API response times
- Error rates
- System resource usage

## 🚀 **Deployment**

### **Vercel Deployment**
1. **Set environment variables** in Vercel dashboard
2. **Deploy from GitHub** (automatic)
3. **Configure database** connection
4. **Test all endpoints**

### **VPS Deployment**
1. **Install MySQL** on VPS
2. **Run database schema**
3. **Deploy Next.js app**
4. **Configure email server** (Postfix/Dovecot)

## 📚 **Testing**

### **API Testing with curl**
```bash
# Test domain listing
curl http://localhost:3000/api/admin/list-domains

# Test email generation
curl -X POST 



http://localhost:3000/api/generate-temp-email \
  -H "Content-Type: application/json" \
  -d '{"domain": "tempmail.com"}'
```

### **Database Testing**
```sql
-- Check domains
SELECT * FROM virtual_domains;

-- Check emails
SELECT * FROM virtual_users;

-- Check messages
SELECT * FROM messages;
```

## 🔮 **Future Enhancements**

### **Planned Features**
- **Email forwarding** rules
- **Spam filtering** integration
- **Attachment handling**
- **User authentication**
- **API rate limiting**
- **Webhook notifications**

### **Scalability Improvements**
- **Database connection pooling**
- **Caching layer** (Redis)
- **Load balancing**
- **Microservices architecture**

---

**Your temporary email backend is ready for production!** 🚀📧

Need help? Check the logs, verify configurations, and test step by step!

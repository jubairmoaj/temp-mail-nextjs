# TempMail - Temporary Email Service (Next.js)

A modern, secure temporary email service built with **Next.js** and **React** that allows users to create disposable email addresses in one click with multiple domain options.

## ✨ Features

- **One-Click Email Generation**: Create temporary emails instantly
- **Multiple Domains**: Choose from various trusted email domains
- **Real-time Inbox**: Auto-refresh inbox every 10 seconds
- **Privacy First**: No registration or personal data required
- **Auto Cleanup**: Emails are automatically deleted after 24 hours
- **Modern UI**: Beautiful, responsive design with smooth animations
- **Copy to Clipboard**: Easy email copying functionality
- **Demo Mode**: Simulated emails for testing purposes
- **TypeScript**: Full type safety and better development experience
- **Next.js 14**: Latest React framework with API routes

## 🚀 Quick Start

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. **Clone or download the project**
   ```bash
   cd "Temp Mail Backend + Admin Panel"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
├── pages/                 # Next.js pages and API routes
│   ├── api/              # API endpoints
│   │   ├── domains.ts           # Get available domains
│   │   ├── generate-email.ts    # Generate new email
│   │   ├── emails/[emailId].ts  # Get/delete emails
│   │   ├── receive-email.ts     # Receive email webhook
│   │   └── demo-email.ts        # Add demo emails
│   ├── _app.tsx         # App wrapper
│   ├── _document.tsx    # Document wrapper
│   └── index.tsx        # Main page
├── styles/               # CSS files
│   └── globals.css      # Global styles
├── package.json          # Dependencies and scripts
├── next.config.js        # Next.js configuration
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

## 🔧 Configuration

### Available Domains

The system comes with these pre-configured domains:
- tempmail.com
- 10minutemail.com
- guerrillamail.com
- mailinator.com
- yopmail.com
- temp-mail.org
- sharklasers.com
- grr.la

### Customizing Domains

To add or modify domains, edit the `domains` array in the API files:

```typescript
const domains = [
  'yourdomain.com',
  'anotherdomain.org',
  // ... add more domains
]
```

### Port Configuration

Change the default port by setting the `PORT` environment variable:

```bash
PORT=8080 npm run dev
```

## 📧 API Endpoints

### GET `/api/domains`
Returns available email domains.

**Response:**
```json
{
  "domains": ["tempmail.com", "10minutemail.com", ...]
}
```

### POST `/api/generate-email`
Creates a new temporary email address.

**Request Body:**
```json
{
  "domain": "tempmail.com"
}
```

**Response:**
```json
{
  "emailId": "uuid-here",
  "email": "random123@tempmail.com",
  "username": "random123",
  "domain": "tempmail.com"
}
```

### GET `/api/emails/:emailId`
Retrieves emails for a specific email address.

**Response:**
```json
{
  "email": "random123@tempmail.com",
  "messages": [
    {
      "id": "message-uuid",
      "from": "sender@example.com",
      "subject": "Email Subject",
      "text": "Email content",
      "html": "<p>Email content</p>",
      "timestamp": 1640995200000
    }
  ]
}
```

### DELETE `/api/emails/:emailId`
Deletes a temporary email address and all its messages.

### POST `/api/receive-email`
Webhook endpoint for receiving emails (for production use).

### POST `/api/demo-email`
Adds a demo email to an existing temporary email for testing.

## 🎯 How It Works

1. **Email Generation**: User selects a domain and clicks "Generate Email"
2. **Random Username**: System generates a random 8-character username
3. **Email Creation**: Combines username with selected domain
4. **Storage**: Email and messages stored in memory (with 24-hour cleanup)
5. **Real-time Updates**: Inbox refreshes automatically every 10 seconds
6. **Demo Mode**: Use the demo email API to add sample emails for testing

## 🛡️ Security Features

- **Input Validation**: All inputs are validated and sanitized
- **XSS Prevention**: HTML content is properly escaped
- **Type Safety**: Full TypeScript support for better security
- **API Protection**: Proper HTTP method validation

## 🚀 Production Deployment

For production deployment, consider:

1. **Database**: Replace in-memory storage with Redis or MongoDB
2. **Email Service**: Integrate with real email services (SendGrid, Mailgun)
3. **HTTPS**: Enable SSL/TLS encryption
4. **Environment Variables**: Use `.env.local` file for configuration
5. **Logging**: Add proper logging (Winston, Bunyan)
6. **Monitoring**: Add health checks and monitoring

### Environment Variables

Create a `.env.local` file:

```env
PORT=3000
NODE_ENV=production
EMAIL_SERVICE_API_KEY=your_api_key
DATABASE_URL=your_database_url
```

### Build and Deploy

```bash
# Build for production
npm run build

# Start production server
npm start

# Or deploy to Vercel
npm run build
vercel --prod
```

## 🧪 Testing

The system includes a demo mode that allows you to add sample emails via the `/api/demo-email` endpoint. This helps you test the functionality without needing to send real emails.

### Adding Demo Emails

```bash
curl -X POST http://localhost:3000/api/demo-email \
  -H "Content-Type: application/json" \
  -d '{"emailId": "your-email-id-here"}'
```

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. Create new API routes in `pages/api/`
2. Add new components in `components/` directory
3. Update types and interfaces as needed
4. Test thoroughly before committing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process using port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Dependencies not installed**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **TypeScript errors**
   ```bash
   npm run build
   # Fix any type errors that appear
   ```

4. **Next.js cache issues**
   ```bash
   rm -rf .next
   npm run dev
   ```

### Getting Help

If you encounter any issues:
1. Check the console for error messages
2. Ensure all dependencies are installed
3. Verify Node.js version compatibility (18+)
4. Check if the port is available
5. Clear Next.js cache if needed

## 🎉 Features in Action

- **Instant Email Creation**: Generate emails in milliseconds
- **Real-time Inbox**: See new emails as they arrive
- **Responsive Design**: Works perfectly on all devices
- **Smooth Animations**: Beautiful UI transitions
- **Copy Functionality**: One-click email copying
- **Auto-refresh**: Never miss an email
- **Type Safety**: Full TypeScript support
- **Modern React**: Built with React 18 and Next.js 14

## 🔄 Migration from Express

This project has been migrated from a traditional Express.js backend to Next.js. The benefits include:

- **Unified Frontend/Backend**: Single codebase for both
- **API Routes**: Built-in API endpoints
- **TypeScript**: Better type safety
- **Modern React**: Latest React features
- **Better Performance**: Optimized builds
- **Easier Deployment**: Deploy to Vercel with one click

---

**Happy Temporary Emailing with Next.js! 🚀📧⚛️**

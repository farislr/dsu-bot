# DSU Bot - Daily Standup Update

A Next.js web application for submitting daily standup updates that automatically posts to Google Chat and saves to Google Sheets.

## Features

### Core Functionality
- 📊 **Dual Submission**: Posts standup updates to both Google Chat (as formatted cards) and Google Sheets
- 🔄 **Auto-fill**: Automatically fills "yesterday" field from your previous "today" entry
- 💾 **History Tracking**: Retrieves your last standup entry based on email
- 🎯 **Thread Grouping**: Groups all daily standups in a single Google Chat thread

### User Experience
- ✨ **Modern UI**: Beautiful, responsive interface built with shadcn/ui and Tailwind CSS
- 📱 **Responsive Design**: Mobile-first design with adaptive layouts
- ⚡ **Real-time Feedback**: Loading states and visual feedback for all operations
- 🔐 **Secure Authentication**: Firebase Authentication with Google Sign-In

### DevOps & Deployment
- 🐳 **Docker Ready**: Production-ready Docker configuration with health checks
- ⚙️ **PM2 Support**: Process management for VPS/local deployments
- 🔄 **Auto-restart**: Automatic recovery from crashes
- 📊 **Monitoring**: Built-in health checks and logging

## Prerequisites

Before setting up the application, ensure you have:

### Required
- **Bun** runtime (v1.0+) - [Install Bun](https://bun.sh/)
- **Firebase Project** - For authentication ([Firebase Console](https://console.firebase.google.com/))
- **Google Chat Webhook URL** - [Create a webhook](https://developers.google.com/chat/how-tos/webhooks)
- **Google Apps Script Web App** - Deployed script for Google Sheets integration

### Optional (for deployment)
- **Docker** and **Docker Compose** - For containerized deployment
- **PM2** - For local/VPS process management (`bun add -g pm2`)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd dsu-bot
```

### 2. Install Dependencies

Using Bun (recommended):
```bash
bun install
```

Or using npm:
```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env .env.local
```

Edit `.env.local` and add your credentials:

```env
GOOGLE_CHAT_WEBHOOK_URL="your-google-chat-webhook-url"
APPS_SCRIPT_WEB_APP_URL="your-apps-script-web-app-url"
```

#### Getting Google Chat Webhook URL

1. Open Google Chat in your browser
2. Go to the space where you want to receive updates
3. Click the space name → **Apps & integrations** → **Webhooks**
4. Create a new webhook and copy the URL

#### Setting up Google Apps Script

1. Create a new [Google Apps Script](https://script.google.com/) project
2. Create a Google Sheet to store standup data
3. Add the following script (customize as needed):

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  
  sheet.appendRow([
    new Date(),
    data.name,
    data.email,
    data.yesterday,
    data.today,
    data.blockers || 'None'
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({success: true}));
}

function doGet(e) {
  const email = e.parameter.email;
  const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // Find last entry for this email
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i][2] === email) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: {
          timestamp: data[i][0],
          yesterday: data[i][3],
          today: data[i][4]
        }
      }));
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({success: false}));
}
```

4. Deploy as Web App (Execute as: **Me**, Access: **Anyone**)
5. Copy the deployment URL to `.env.local`

### 4. Run the Development Server

Using Bun (recommended):
```bash
bun dev
```

Or using npm:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Enter your details**: Fill in your name and email
2. **Auto-fill**: If you've submitted before, your previous "today" plan will auto-fill as "yesterday"
3. **Complete the form**:
   - What you accomplished yesterday
   - What you'll work on today
   - Any blockers (optional)
4. **Submit**: Click "Submit Standup"
5. **Confirmation**: You'll see a success message when posted to both Google Chat and Sheets

## Project Structure

```
dsu-bot/
├── app/
│   ├── api/
│   │   └── standup/
│   │       └── route.ts          # API endpoints (POST/GET)
│   ├── page.tsx                   # Main standup form UI
│   └── layout.tsx                 # Root layout
├── components/
│   └── ui/                        # shadcn/ui components
├── lib/
│   └── utils.ts                   # Utility functions
├── public/                        # Static assets
├── .env.local                     # Environment variables (create this)
├── package.json
└── README.md
```

## Available Scripts

### Development
- `bun dev` - Start development server
- `bun run build` - Build for production
- `bun start` - Start production server (standalone)
- `bun run lint` - Run ESLint
- `bun test` - Run tests

### PM2 Process Management (Local/VPS)
- `bun run pm2:start` - Start with PM2
- `bun run pm2:stop` - Stop PM2 process
- `bun run pm2:restart` - Restart PM2 process
- `bun run pm2:logs` - View PM2 logs
- `bun run pm2:monit` - Monitor PM2 resources

### Docker Deployment
- `bun run docker:build` - Build Docker image
- `bun run docker:up` - Start Docker container
- `bun run docker:down` - Stop Docker container
- `bun run docker:logs` - View Docker logs

## Technologies Used

### Core Stack
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router (Standalone output mode)
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Bun](https://bun.sh/)** - Fast JavaScript runtime and package manager
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable component library

### Backend & Integration
- **[Firebase Authentication](https://firebase.google.com/docs/auth)** - User authentication with Google Sign-In
- **[Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)** - Server-side authentication verification
- **[Google Chat API](https://developers.google.com/chat)** - Webhook integration for standup notifications
- **[Google Apps Script](https://developers.google.com/apps-script)** - Sheets integration for data persistence

### DevOps & Deployment
- **[Docker](https://www.docker.com/)** - Containerization for production deployment
- **[PM2](https://pm2.keymetrics.io/)** - Process manager for local/VPS deployment
- **[Docker Compose](https://docs.docker.com/compose/)** - Multi-container orchestration

## Deployment

### Production Deployment Options

#### Option 1: Docker (Recommended for Production)

**Recommended for:** Production deployments, containerized environments, CI/CD pipelines

**Architecture:**
- Next.js standalone server running on Bun runtime
- Docker handles process management and health monitoring
- Multi-stage build for optimized image size
- Non-root user for security

**Quick Start:**
```bash
# 1. Configure environment variables
cp .env.example .env
# Edit .env with your actual values

# 2. Build and run with Docker Compose
bun run docker:build
bun run docker:up

# 3. View logs
bun run docker:logs

# Access at http://localhost:3000
```

**Features:**
- ✅ Automatic restart on failure
- ✅ Health check monitoring every 30s
- ✅ Persistent log volumes
- ✅ Environment-based configuration
- ✅ Network isolation

**See [DEPLOYMENT.md](DEPLOYMENT.md) for complete Docker deployment guide.**

#### Option 2: PM2 (Local/VPS Deployment)

**Recommended for:** VPS deployments, bare metal servers, local production testing

**Architecture:**
- PM2 process manager with cluster mode
- Auto-restart on crashes (max 10 attempts)
- Memory limit management (1GB)
- Log rotation and monitoring

**Quick Start:**
```bash
# 1. Install PM2 globally
bun add -g pm2

# 2. Build the application
bun run build

# 3. Start with PM2
bun run pm2:start

# 4. View logs and monitor
bun run pm2:logs
bun run pm2:monit

# Access at http://localhost:3000
```

**Features:**
- ✅ Cluster mode for load balancing
- ✅ Automatic restart with delay
- ✅ Memory-based restart (1GB limit)
- ✅ Structured logging with timestamps
- ✅ Process monitoring dashboard

**Management Commands:**
```bash
pm2 status              # Check process status
pm2 restart dsu-bot     # Restart application
pm2 stop dsu-bot        # Stop application
pm2 delete dsu-bot      # Remove from PM2
```

**See [DEPLOYMENT.md](DEPLOYMENT.md) for complete PM2 deployment guide.**

#### Option 3: Vercel (Serverless)

The easiest way for serverless deployment:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

1. Push your code to GitHub
2. Import the project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

#### Option 4: Other Platforms

This app can be deployed on any platform that supports Next.js:
- **Netlify**: Serverless deployment with build plugins
- **Railway**: Container-based deployment with auto-scaling
- **Render**: Docker or native builds with persistent disks
- **AWS Amplify**: Full-stack serverless deployment

**Important:** Make sure to set all environment variables on your deployment platform.

For detailed deployment instructions, monitoring, and troubleshooting, see **[DEPLOYMENT.md](DEPLOYMENT.md)**.

---

## Quick Reference

### Development Workflow
```bash
# Setup
bun install
cp .env.example .env.local
# Configure .env.local with Firebase credentials

# Development
bun dev                    # Start dev server at http://localhost:3000

# Production Build
bun run build              # Build Next.js application
```

### Docker Deployment (Recommended)
```bash
# One-time setup
cp .env.example .env
# Edit .env with production credentials

# Deploy
bun run docker:build       # Build Docker image
bun run docker:up          # Start container (detached)
bun run docker:logs        # View logs
bun run docker:down        # Stop container
```

### PM2 Deployment (VPS/Local)
```bash
# One-time setup
bun add -g pm2             # Install PM2 globally
bun run build              # Build application

# Deploy
bun run pm2:start          # Start with PM2
bun run pm2:logs           # View logs
bun run pm2:monit          # Monitor resources
bun run pm2:restart        # Restart app
bun run pm2:stop           # Stop app
```

### Key Files
- `next.config.ts` - Next.js configuration (standalone output enabled)
- `ecosystem.config.js` - PM2 process configuration
- `Dockerfile` - Docker build configuration
- `docker-compose.yml` - Docker orchestration
- `.env.local` / `.env` - Environment variables
- `DEPLOYMENT.md` - Detailed deployment guide
- `AUTHENTICATION_SETUP.md` - Firebase setup guide

---

## Troubleshooting

### Webhook not working
- Verify the webhook URL is correct and active
- Check Google Chat space permissions
- Review browser console for errors

### Apps Script errors
- Ensure the script is deployed as a Web App
- Check script permissions (should be "Anyone")
- Verify the Google Sheet ID in the script
- Check Apps Script execution logs

### Auto-fill not working
- Ensure email is entered correctly
- Check that previous standup was saved
- Verify Apps Script GET endpoint is working

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

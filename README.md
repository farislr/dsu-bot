# DSU Bot - Daily Standup Update

A Next.js web application for submitting daily standup updates that automatically posts to Google Chat and saves to Google Sheets.

## Features

- 📊 **Dual Submission**: Posts standup updates to both Google Chat (as formatted cards) and Google Sheets
- 🔄 **Auto-fill**: Automatically fills "yesterday" field from your previous "today" entry
- 💾 **History Tracking**: Retrieves your last standup entry based on email
- 🎯 **Thread Grouping**: Groups all daily standups in a single Google Chat thread
- ✨ **Modern UI**: Beautiful, responsive interface built with shadcn/ui and Tailwind CSS
- ⚡ **Real-time Updates**: Debounced email lookup for seamless UX

## Prerequisites

Before setting up the application, ensure you have:

- **Node.js** (v20 or higher) or **Bun** runtime
- **Google Chat Webhook URL** - [Create a webhook](https://developers.google.com/chat/how-tos/webhooks)
- **Google Apps Script Web App** - Deployed script for Google Sheets integration

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd dsu-bot
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using Bun:
```bash
bun install
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

Using npm:
```bash
npm run dev
```

Using Bun:
```bash
bun dev
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

- `npm run dev` / `bun dev` - Start development server
- `npm run build` / `bun run build` - Build for production
- `npm start` / `bun start` - Start production server
- `npm run lint` / `bun run lint` - Run ESLint
- `npm test` / `bun test` - Run tests

## Technologies Used

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable component library
- **[Google Chat API](https://developers.google.com/chat)** - Chat integration
- **[Google Apps Script](https://developers.google.com/apps-script)** - Sheets integration

## Deployment

### Deploy on Vercel

The easiest way to deploy:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

1. Push your code to GitHub
2. Import the project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Deploy on Other Platforms

This app can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

Make sure to set the environment variables on your deployment platform.

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

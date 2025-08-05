# Feline Finder

This is a Next.js application built with Firebase Studio for finding and listing stray cats in your area.

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [Firebase CLI](https://firebase.google.com/docs/cli)

### 1. Installation

First, install the project dependencies using npm:

```bash
npm install
```

### 2. Firebase Setup

This application requires a Firebase project to handle authentication and the database.

1.  If you don't have one already, create a new project in the [Firebase Console](https://console.firebase.google.com/).
2.  Add a new **Web App** to your project.
3.  Firebase will provide you with a configuration object. Create a new file named `.env.local` in the root of your project.
4.  Copy and paste your Firebase web app configuration into `.env.local` like this:

```
NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"
```

> **Note:** The `.env` file in this project is already populated with credentials for a test project, but for your own deployment, you should use your own Firebase project.

### 3. Running the Development Server

This application has two main parts: the Next.js frontend and the Genkit AI backend. You'll need to run both concurrently in separate terminal windows.

**Terminal 1: Run the Next.js Frontend**

```bash
npm run dev
```

This will start the Next.js application on [http://localhost:9002](http://localhost:9002).

**Terminal 2: Run the Genkit AI Service**

The AI features (like the duplicate cat check) are handled by Genkit.

```bash
npm run genkit:watch
```

This command starts the Genkit development service and will automatically restart it when you make changes to the AI flow files.

### 4. Building for Production

To create a production-ready version of your app, run the following command:

```bash
npm run build
```

This will create an optimized build in the `.next` folder. You can then start the production server with:

```bash
npm start
```

### 5. Deploying to Firebase

To deploy your application to Firebase App Hosting, run the following command from your project's root directory:

```bash
firebase apphosting:backends:deploy
```

You may be prompted to select your Firebase project and the backend resource to deploy.

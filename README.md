# PrepWise.AI - Real-Time AI Voice Agent Interview Platform

PrepWise.AI is a next-generation full-stack mock interview application designed to help job seekers practice technical and behavioral interviews with real-time AI voice recruiters.

🚀 **Live Deployed Application**: [https://interview-assistant-platform.vercel.app/](https://interview-assistant-platform.vercel.app/)

---

## 🌟 Key Features

* **Real-Time Voice Recruiting**: Integrates the **Vapi.ai Client SDK** to establish low-latency, WebRTC-based conversational voice streams. The AI recruiter dynamically responds to candidate inputs, verbal pauses, and answers.
* **AI Question Generation**: Harnesses **Google Gemini (gemini-1.5-flash)** via a secure serverless API handler to compile dynamic interview questionnaires customized for specific job roles, seniority tiers, and tech stacks.
* **Spoken & Speech Fallbacks**: Incorporates a browser-native fallback engine powered by the **Web Speech API** (`SpeechSynthesis` and `webkitSpeechRecognition`). If API keys are unconfigured, candidates can still speak, listen, and practice completely offline.
* **Granular Scorecards & Analytics**: Evaluates transcripts post-interview using Gemini to compile detailed readiness metrics (Technical depth, Speech delivery, Key strengths, Areas to focus on, and Study recommendations).
* **Local Database & Authentication**: Persistence layer built using HTML5 `LocalStorage` to save completed scorecard history, inspect transcript logs, and toggle between mock candidate profiles out of the box.

---

## 🛠️ Technology Stack

* **Backend Service**: Spring Boot 3.4 (Java 21/25, Spring Data JPA, REST APIs, H2 In-Memory DB)
* **Frontend Client**: Next.js 16 (React 19, TypeScript, App Router)
* **Styling**: Tailwind CSS v4 (Glassmorphic dark design system)
* **Real-time Speech Channels**: Vapi.ai (WebRTC Audio Stream, Voice Activity Detection)
* **Generative Intelligence**: Google Gemini API (`gemini-1.5-flash`)
* **Persistence**: Spring Data JPA + H2 In-Memory Database (with `/h2-console`) and LocalStorage fallback
* **Architecture & Interview Guide**: See [SPRING_BOOT_ARCHITECTURE_GUIDE.md](SPRING_BOOT_ARCHITECTURE_GUIDE.md)

---

## 🚀 Getting Started

### 1. Installation
Clone the repository and install the project dependencies:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root of the project to add your API credentials:
```env
# 1. Google Gemini API Key
# Get a free key from: https://aistudio.google.com/
GEMINI_API_KEY="your-gemini-api-key"

# 2. Vapi.ai Public Key
# Get a key from: https://dashboard.vapi.ai/
NEXT_PUBLIC_VAPI_PUBLIC_KEY="your-vapi-public-key"

# 3. Vapi Assistant ID (Required for Free Tier Calls)
# Create an assistant in Vapi dashboard and copy its ID
NEXT_PUBLIC_VAPI_ASSISTANT_ID="your-vapi-assistant-id"
```
*(If keys are left blank, the application automatically runs in browser-native Speech Simulation mode).*

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to start practicing.

### 4. Build for Production
To generate an optimized production build:
```bash
npm run build
```

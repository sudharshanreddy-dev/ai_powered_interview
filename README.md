# AI Interview Platform

A full-stack application for conducting AI-powered mock interviews with real-time transcription and feedback.

---

## 🚀 Features

### 🧑‍💼 User Authentication
- JWT-based registration/login
- Refresh token rotation
- Secure cookie storage

### 🎤 Interview Management
- Create interviews with custom topics
- Select difficulty levels (Beginner / Intermediate / Advanced)
- Track interview progress
- View interview history

### 🧠 Real-time AI Features
- Dynamic question generation
- Live speech-to-text transcription
- Response analysis (technical accuracy, clarity, relevance)
- Personalized feedback generation

### 🔌 WebSocket Integration
- Real-time interview sessions
- Live transcription streaming
- Interactive Q&A flow

---

## 🛠 Tech Stack

### Backend
- **Node.js** with **Express**
- **Prisma ORM** (PostgreSQL)
- **Socket.io** (WebSockets)
- **JWT** authentication
- **Zod** for input validation

### AI Services
- **OpenRouter API** (LLM integration)
- **AssemblyAI** (real-time transcription)

### Frontend
- _Not included in this repository (connect your own frontend)_

---

## 🔐 Environment Variables

Create a `.env` file in the root directory and include:

```env
DATABASE_URL="postgresql://..."
ACCESS_SECRET="your_jwt_access_secret"
REFRESH_SECRET="your_jwt_refresh_secret"
OPENROUTER_API_KEY="your_openrouter_api_key"
ASSEMBLYAI_API_KEY="your_assemblyai_api_key"
```
## 📡 API Endpoints

### 🔒 Authentication

| Method | Endpoint        | Description          |
|--------|------------------|----------------------|
| POST   | `/auth/register` | User registration    |
| POST   | `/auth/login`    | User login           |
| GET    | `/auth/refresh`  | Refresh access token |
| POST   | `/auth/logout`   | User logout          |

### 🧪 Interviews

| Method | Endpoint                            | Description                |
|--------|-------------------------------------|----------------------------|
| POST   | `/interview`                        | Create new interview       |
| GET    | `/interview`                        | List user's interviews     |
| GET    | `/interview/:id`                    | Get interview details      |
| DELETE | `/interview/:id`                    | Cancel interview           |
| GET    | `/interview/:id/feedback`           | Get interview feedback     |
| GET    | `/interview/:id/progress`           | Get interview progress     |
| POST   | `/interview/:id/questions`          | Add follow-up question     |

---

## 🔁 WebSocket Events

### 🔼 Client → Server

- `start_interview` — Initialize new session  
- `audio_chunk` — Send audio data for transcription  
- `submit_answer` — Submit response for analysis  
- `request_next_question` — Get next question  
- `end_interview` — Terminate session  

### 🔽 Server → Client

- `transcript_update` — Live transcription updates  
- `analysis_result` — Response evaluation  
- `next_question` — Next question in sequence  
- `interview_complete` — Interview finished  
- `feedback_ready` — Final feedback available  

---

## ⚙️ Setup

### Install dependencies

```bash
cd backend
npm install


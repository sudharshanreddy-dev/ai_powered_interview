import { Server } from "socket.io";
import { httpServer } from "../app.js";
import { verify_access_token } from "./token.js";
import { AssemblyAI } from "assemblyai";
import prisma from "../utils/prisma.js";




const assemblyClient = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });


const activeUsers = new Map();

const activeInterviews = new Map();

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        credentials: true,
        methods: ["GET", "POST"],
    },
    transports: ['websocket']
});

io.use((socket, next) => {
    const token = socket.request.cookies?.access_token;

    if (!token) {
        return next(new Error("Authentication error"));
    }

    try {
        const decoded = verify_access_token(token);

        socket.data = {
            userId: decoded.id,
        }
        next()
    }
    catch (err) {
        return next(new Error("Authentication error"));
    }
})


io.on("connection", (socket) => {
    const userId = socket.data.userId;
    console.log(`User connected: ${userId} Socket ID: ${socket.id}`);

    activeUsers.set(userId, socket.id);

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${userId} Socket ID: ${socket.id}`);
        activeUsers.delete(userId);
    });

    socket.on('error', (error) => {
        console.error(`Socket error: ${error.message}`);
    })

    socket.on('start_interview', async ({ interviewId }) => {
        try {
            // 1. Validate interview exists and belongs to user
            const interview = await prisma.interview.findUnique({
                where: { id: interviewId, userId: socket.data.userId }
            });

            if (!interview) {
                return socket.emit('error', { message: 'Invalid interview' });
            }

            // 2. Initialize real-time transcription
            const transcriber = await assemblyClient.realtime.transcribe({
                sample_rate: 16_000,
                word_boost: interview.topic.split(' '),
            });

            transcriber.on('transcript', (transcript) => {
                if (!transcript.text) return;
                io.to(interviewId).emit('transcript_update', {
                    text: transcript.text,
                    isPartial: transcript.isPartial
                });
            });

            transcriber.on('error', (error) => {
                console.error('Transcription error:', error);
                socket.emit('error', { message: 'Transcription service failed' });
            });

            activeInterviews.set(interviewId, {
                socketId: socket.id,
                transcriber,
                interviewData: interview,
                currentQuestionIndex: 0
            });

            socket.join(interviewId);
            socket.emit('interview_ready', {
                interviewId,
                firstQuestion: JSON.parse(interview.questions)[0]
            });

        } catch (error) {
            console.error('Session start failed:', error);
            socket.emit('error', { message: 'Failed to start session' });
        }
    });

    socket.on('audio_chunk', (data) => {
        const session = activeInterviews.get(data.interviewId);
        session?.transcriber?.sendAudio(data.chunk);
    });

    // Add after the existing event handlers in socket.js
socket.on('submit_answer', async ({ interviewId, questionIndex, transcript }) => {
    try {
        const session = activeInterviews.get(interviewId);
        if (!session) return;

        // 1. Get current question
        const questions = JSON.parse(session.interviewData.questions);
        const currentQuestion = questions[questionIndex];

        // 2. Analyze response
        const analysis = await analyzeResponse(currentQuestion, transcript);
        
        // 3. Store analysis
        await prisma.interview.update({
            where: { id: interviewId },
            data: { 
                analysis: {
                    push: {
                        questionIndex,
                        ...analysis
                    }
                }
            }
        });

        // 4. Send analysis to client
        socket.emit('analysis_result', {
            questionIndex,
            analysis
        });

    } catch (error) {
        console.error('Answer analysis failed:', error);
        socket.emit('error', { message: 'Failed to analyze response' });
    }
});

socket.on('request_next_question', async ({ interviewId }) => {
    const session = activeInterviews.get(interviewId);
    if (!session) return;

    const questions = JSON.parse(session.interviewData.questions);
    session.currentQuestionIndex++;

    if (session.currentQuestionIndex < questions.length) {
        io.to(interviewId).emit('next_question', {
            question: questions[session.currentQuestionIndex],
            index: session.currentQuestionIndex,
            isLast: session.currentQuestionIndex === questions.length - 1
        });
    } else {
        io.to(interviewId).emit('interview_complete');
    }
});

socket.on('end_interview', async ({ interviewId }) => {
    try {
        
        await generateFinalFeedback(interviewId);
        
        
        const session = activeInterviews.get(interviewId);
        if (session?.transcriber) {
            session.transcriber.close();
        }
        activeInterviews.delete(interviewId);

        io.to(interviewId).emit('feedback_ready');

    } catch (error) {
        console.error('Feedback generation failed:', error);
        socket.emit('error', { message: 'Failed to generate feedback' });
    }
});
});

function findInterviewIdBySocket(socketId) {
    for (const [interviewId, session] of activeInterviews) {
        if (session.socketId === socketId) {
            return interviewId;
        }
    }
    return null;
}

export { io, activeUsers };
import prisma from "../utils/prisma.js";
import {generateQuestions} from "../service/ai.service.js";

export const createInterview = async (req, res) => {
    const { topic, difficulty } = req.body;
    const userId = req.user.id;

    try{
        const questions = await generateQuestions(topic, difficulty);
        const interview = await prisma.interview.create({
            data: {
                userId,
                topic,
                difficulty,
                status: "Active",
                questions: JSON.stringify(questions)
            }
        });


        

        return res.status(201).json({
            message: "Interview created successfully",
            interviewId: interview.id,
            questions 
        });

    }
    catch(err){
        console.error("Interview creation failed:", error);
        return res.status(500).json({ 
            error: "Interview initialization failed" 
        });

    }
}

export const getFeedback = async (req, res) => {
    try {
        const interview = await prisma.interview.findUnique({
            where: { 
                id: req.params.id,
                userId: req.user.id 
            }
        });

        if (!interview?.feedback) {
            return res.status(404).json({ error: 'Feedback not ready' });
        }

        res.json(JSON.parse(interview.feedback));
    } catch (error) {
        console.error('Feedback fetch failed:', error);
        res.status(500).json({ error: 'Failed to get feedback' });
    }
};

// Get all interviews for current user
export const getInterviews = async (req, res) => {
    try {
        const interviews = await prisma.interview.findMany({
            where: { userId: req.user.id },
            select: {
                id: true,
                topic: true,
                status: true,
                createdAt: true
            }
        });
        res.json(interviews);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch interviews" });
    }
};

// Get detailed interview data
export const getInterviewDetails = async (req, res) => {
    try {
        const interview = await prisma.interview.findUnique({
            where: { 
                id: req.params.id,
                userId: req.user.id 
            },
            include: {
                analysis: true
            }
        });
        res.json(interview);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch interview" });
    }
};

// Cancel an interview
export const cancelInterview = async (req, res) => {
    try {
        await prisma.interview.update({
            where: { 
                id: req.params.id,
                userId: req.user.id,
                status: 'ACTIVE'
            },
            data: { status: 'TERMINATED' }
        });
        res.json({ message: "Interview cancelled" });
    } catch (error) {
        res.status(500).json({ error: "Failed to cancel interview" });
    }
};

// Get progress (for real-time updates)
export const getInterviewProgress = async (req, res) => {
    try {
        const progress = await prisma.interviewProgress.findUnique({
            where: { interviewId: req.params.id }
        });
        res.json(progress);
    } catch (error) {
        res.status(500).json({ error: "Failed to get progress" });
    }
};

// Add dynamic follow-up questions
export const addFollowUpQuestion = async (req, res) => {
    try {
        const question = await prisma.question.create({
            data: {
                interviewId: req.params.id,
                text: req.body.question,
                isFollowUp: true
            }
        });
        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ error: "Failed to add question" });
    }
};
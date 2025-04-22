import { Router } from "express";
import { createInterview,getInterviews,getInterviewDetails,cancelInterview,getFeedback,getInterviewProgress,addFollowUpQuestion } from "../controllers/interview.controller.js";
import { authorize } from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import { interviewSchema } from "../schema/interview.schema.js";

export const interview_router = Router();

interview_router.post("/", authorize, validate(interviewSchema), createInterview);
interview_router.get("/", authorize, getInterviews);
interview_router.get("/:id", authorize, getInterviewDetails);
interview_router.delete("/:id", authorize, cancelInterview);

// Progress Tracking
interview_router.get("/:id/feedback", authorize, getFeedback);
interview_router.get("/:id/progress", authorize, getInterviewProgress);

// Dynamic Questions
interview_router.post("/:id/questions", authorize, addFollowUpQuestion);


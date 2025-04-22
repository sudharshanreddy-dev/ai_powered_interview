export const generateFinalFeedback = async (interviewId) => {
    const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        include: { user: true }
    });

    const prompt = `
    Generate final feedback for ${interview.user.name}'s interview on ${interview.topic}.
    Analysis data: ${JSON.stringify(interview.analysis)}
    
    Return JSON with:
    - overallScore (1-5)
    - strengths[]
    - improvementAreas[]
    - personalizedAdvice[]
    `;

    const feedback = await OpenRouter.createCompletion({
        model: 'anthropic/claude-3-opus',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500
    });

    await prisma.interview.update({
        where: { id: interviewId },
        data: { 
            feedback: JSON.parse(feedback),
            status: 'COMPLETED',
            completedAt: new Date() 
        }
    });
};
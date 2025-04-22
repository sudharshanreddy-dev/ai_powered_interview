import axios from 'axios';

export const analyzeResponse = async (question, response) => {
    const prompt = `Analyze this interview response for:
    - Technical accuracy (1-5)
    - Communication clarity (1-5)
    - Relevance to question (1-5)
    - Suggested improvements (bullet points)
    
    Question: ${question}
    Response: ${response}
    
    Return JSON format: {
      technicalScore: number,
      clarityScore: number,
      relevanceScore: number,
      improvements: string[]
    }`;

    try {
        const result = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' }
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': process.env.FRONTEND_URL,
                    'X-Title': 'AI Interview Platform'
                }
            }
        );

        return result.data.choices[0].message.content;
    } catch (error) {
        console.error('Analysis error:', error.response?.data || error.message);
        throw new Error('Analysis service unavailable');
    }
};

export const generateFinalFeedback = async (interviewId) => {
    const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        include: { user: true }
    });

    const prompt = `Generate comprehensive feedback for ${interview.user.name}'s interview on ${interview.topic}.
    Analysis data: ${JSON.stringify(interview.analysis)}
    
    Include:
    - Overall performance (1-5)
    - 3 key strengths
    - 3 areas for improvement
    - Personalized advice for future interviews`;

    try {
        const result = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'anthropic/claude-3-opus',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' },
                max_tokens: 1000
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const feedback = result.data.choices[0].message.content;

        await prisma.interview.update({
            where: { id: interviewId },
            data: { 
                feedback,
                status: 'COMPLETED',
                completedAt: new Date()
            }
        });

        return feedback;
    } catch (error) {
        console.error('Feedback error:', error.response?.data || error.message);
        throw new Error('Feedback service unavailable');
    }
};
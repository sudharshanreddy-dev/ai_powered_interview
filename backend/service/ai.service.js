import axios from 'axios';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export const generateQuestions = async (topic, difficulty) => {
    const prompt = `Generate 3-5 interview questions about ${topic} for a ${difficulty} level candidate.
    Return ONLY a JSON array of question strings. Example: ["Q1", "Q2"]`;

    try {
        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "deepseek/deepseek-r1:free",
                messages: [{ role: "user", content: prompt }],
                response_format: "json", 
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        
        const questions = JSON.parse(response.data.choices[0].message.content);

        return Array.isArray(questions) ? questions : [];
    } catch (error) {
        console.error("Question generation failed:", error.response?.data || error.message);
        throw new Error("Failed to generate questions");
    }
};

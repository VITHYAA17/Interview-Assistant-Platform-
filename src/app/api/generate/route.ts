import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { role, level, techStack, questionsCount } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_key') {
      console.warn('Gemini API key is not configured. Returning pre-generated questions.');
      
      // Fallback generator based on parameters
      const fallbackQuestions = [
        `Hello! Welcome to your technical interview. To start, could you introduce yourself and tell me about a major project you worked on using ${techStack}?`,
        `For a ${level} position, we expect deep understanding. Can you explain key architecture design patterns that are common when using ${techStack}?`,
        `Let's discuss coding practices. How do you handle scalability, debugging, and memory optimizations in this context?`,
        `Could you describe a challenging problem you solved in production and how you verified your solution was correct?`,
        `Finally, how do you approach developer collaboration, mentoring, and code reviews within a team?`
      ];

      return NextResponse.json({ questions: fallbackQuestions.slice(0, questionsCount || 5), isMock: true });
    }

    // Call Gemini using official SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a professional technical recruiter. Generate a JSON array of exactly ${questionsCount || 5} interview questions for a candidate interviewing for a ${level} ${role} role. 
    The tech stack involves: ${techStack}. 
    Return ONLY a valid JSON object with a single field "questions" which is an array of strings. Do not include markdown code block syntax (like \`\`\`json) in your response. Just return the raw JSON string.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    // Clean potential markdown blocks
    const cleanJsonText = responseText
      .replace(/^```json/i, '')
      .replace(/```$/, '')
      .trim();

    const data = JSON.parse(cleanJsonText);
    return NextResponse.json({ questions: data.questions || [], isMock: false });
  } catch (error: any) {
    console.error('Error generating questions with Gemini:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions', details: error.message },
      { status: 500 }
    );
  }
}

package com.prepwise.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prepwise.dto.GenerateQuestionsRequest;
import com.prepwise.dto.GenerateQuestionsResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class QuestionService {

    private static final Logger logger = LoggerFactory.getLogger(QuestionService.class);

    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public QuestionService(GeminiService geminiService, ObjectMapper objectMapper) {
        this.geminiService = geminiService;
        this.objectMapper = objectMapper;
    }

    public GenerateQuestionsResponse generateQuestions(GenerateQuestionsRequest request) {
        int count = request.getQuestionsCount() != null && request.getQuestionsCount() > 0 ? request.getQuestionsCount() : 5;
        String role = request.getRole() != null ? request.getRole() : "Software Engineer";
        String level = request.getLevel() != null ? request.getLevel() : "Mid-Level";
        String techStack = request.getTechStack() != null ? request.getTechStack() : "Full Stack";

        if (geminiService.isConfigured()) {
            try {
                String prompt = String.format("""
                        You are a professional technical recruiter. Generate a JSON array of exactly %d interview questions for a candidate interviewing for a %s %s role.
                        The tech stack involves: %s.
                        Return ONLY a valid JSON object with a single field "questions" which is an array of strings. Do not include markdown code block syntax (like ```json) in your response. Just return the raw JSON string.
                        """,
                        count, level, role, techStack
                );

                String rawJson = geminiService.generateContent(prompt);
                JsonNode root = objectMapper.readTree(rawJson);
                JsonNode questionsNode = root.path("questions");

                if (questionsNode.isArray() && !questionsNode.isEmpty()) {
                    List<String> list = new ArrayList<>();
                    for (JsonNode q : questionsNode) {
                        list.add(q.asText());
                    }
                    return new GenerateQuestionsResponse(list, false);
                }
            } catch (Exception e) {
                logger.warn("Failed to generate questions using Gemini AI, falling back to dynamic template: {}", e.getMessage());
            }
        }

        return new GenerateQuestionsResponse(buildFallbackQuestions(role, level, techStack, count), true);
    }

    private List<String> buildFallbackQuestions(String role, String level, String techStack, int count) {
        List<String> questions = new ArrayList<>();
        questions.add(String.format("Hello! Welcome to your technical interview for the %s %s position. To start, could you introduce yourself and walk me through a major project you built using %s?", level, role, techStack));
        questions.add(String.format("For a %s role, architecture and clean design are vital. How do you structure applications and manage state when working with %s?", level, techStack));
        questions.add(String.format("Let's discuss real-world constraints. How do you handle performance bottlenecks, memory leaks, and scalability challenges in %s?", techStack));
        questions.add("Could you describe a challenging technical issue or production incident you resolved, and how you ensured it wouldn't happen again?");
        questions.add("Finally, how do you approach code reviews, engineering collaboration, and mentoring fellow developers on your team?");

        if (count < questions.size()) {
            return questions.subList(0, count);
        }
        return questions;
    }
}

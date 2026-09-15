package com.prepwise.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prepwise.dto.EvaluateRequest;
import com.prepwise.dto.EvaluateResponse;
import com.prepwise.dto.TranscriptMessageDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class EvaluationService {

    private static final Logger logger = LoggerFactory.getLogger(EvaluationService.class);

    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;
    private final Random random = new Random();

    public EvaluationService(GeminiService geminiService, ObjectMapper objectMapper) {
        this.geminiService = geminiService;
        this.objectMapper = objectMapper;
    }

    public EvaluateResponse evaluateInterview(EvaluateRequest request) {
        List<TranscriptMessageDto> transcript = request.getTranscript() != null ? request.getTranscript() : List.of();
        int targetQuestions = request.getQuestionsCount() > 0 ? request.getQuestionsCount() : 5;

        // Extract user messages to calculate delivery metrics
        List<TranscriptMessageDto> userMessages = transcript.stream()
                .filter(m -> "user".equalsIgnoreCase(m.getRole()))
                .toList();

        int actualAnswersGiven = userMessages.size();
        double completionRate = targetQuestions > 0 ? ((double) actualAnswersGiven / targetQuestions) : 0.0;

        int totalLength = userMessages.stream()
                .mapToInt(m -> m.getText() != null ? m.getText().trim().length() : 0)
                .sum();
        double avgAnswerLength = actualAnswersGiven > 0 ? ((double) totalLength / actualAnswersGiven) : 0.0;

        // If Gemini is configured, attempt AI evaluation
        if (geminiService.isConfigured()) {
            try {
                return evaluateWithGemini(request, userMessages, actualAnswersGiven, completionRate);
            } catch (Exception e) {
                logger.warn("Gemini evaluation failed, falling back to rule-based evaluation engine: {}", e.getMessage());
            }
        } else {
            logger.info("Gemini API key not configured or in mock mode. Running rule-based evaluation engine.");
        }

        return runRuleBasedEvaluation(actualAnswersGiven, completionRate, avgAnswerLength);
    }

    private EvaluateResponse evaluateWithGemini(EvaluateRequest request, List<TranscriptMessageDto> userMessages,
                                                int actualAnswersGiven, double completionRate) throws Exception {
        String transcriptJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(request.getTranscript());

        String prompt = String.format("""
                You are a senior technical interviewer. Evaluate the candidate's performance based on the following mock interview parameters and transcript.

                Configuration:
                - Role: %s
                - Level: %s
                - Target Tech Stack: %s
                - Target Questions Count: %d

                Transcript:
                %s

                CRITICAL GRADING RULES (FOLLOW STRICTLY):
                1. Completion check:
                   - Target questions: %d. Actual answers provided by candidate: %d.
                   - If the candidate stopped the interview early (e.g. they answered fewer questions than target, aborted the session, or transcript is empty/very short), you must penalize them heavily.
                   - If they answered 0 questions, overallScore must be between 5%% and 15%%.
                   - If they completed less than 50%% of the interview, overallScore must be between 20%% and 45%%.
                   - If their answers are extremely brief (e.g. single-word answers like 'yes', 'ok', 'no'), mark their technicalScore and overallScore below 50%%.
                2. Return scores for overallScore, technicalScore, and communicationScore (integers between 0 and 100).
                3. Extract 2-3 clear, bulleted strengths of their answers.
                4. Extract 2-3 weaknesses (especially pointing out if they aborted early or left brief answers).
                5. Provide a clear, actionable study recommendation.

                Return ONLY a valid JSON object matching the following structure:
                {
                  "overallScore": number,
                  "technicalScore": number,
                  "communicationScore": number,
                  "strengths": ["string"],
                  "weaknesses": ["string"],
                  "recommendations": "string"
                }
                Do not include any markdown formatting or code blocks. Just return the raw JSON string.
                """,
                request.getRole(),
                request.getLevel(),
                request.getTechStack(),
                request.getQuestionsCount(),
                transcriptJson,
                request.getQuestionsCount(),
                actualAnswersGiven
        );

        String jsonResponse = geminiService.generateContent(prompt);
        JsonNode node = objectMapper.readTree(jsonResponse);

        int overallScore = node.path("overallScore").asInt(75);
        int technicalScore = node.path("technicalScore").asInt(75);
        int communicationScore = node.path("communicationScore").asInt(80);

        List<String> strengths = new ArrayList<>();
        if (node.path("strengths").isArray()) {
            for (JsonNode s : node.path("strengths")) {
                strengths.add(s.asText());
            }
        }

        List<String> weaknesses = new ArrayList<>();
        if (node.path("weaknesses").isArray()) {
            for (JsonNode w : node.path("weaknesses")) {
                weaknesses.add(w.asText());
            }
        }

        String recommendations = node.path("recommendations").asText("Continue practicing domain-specific technical questions.");

        return new EvaluateResponse(overallScore, technicalScore, communicationScore, strengths, weaknesses, recommendations);
    }

    public EvaluateResponse runRuleBasedEvaluation(int actualAnswersGiven, double completionRate, double avgAnswerLength) {
        int overallScore;
        int technicalScore;
        int communicationScore;
        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        String recommendations;

        if (actualAnswersGiven == 0) {
            overallScore = 15;
            technicalScore = 10;
            communicationScore = 15;
            weaknesses.add("Interview aborted early with zero candidate responses.");
            recommendations = "Ensure you speak clearly into the microphone and answer the recruiter's questions before ending.";
        } else if (completionRate < 0.5) {
            overallScore = 35;
            technicalScore = 30;
            communicationScore = 40;
            weaknesses.add("Interview terminated prematurely (completed less than half of the questions).");
            recommendations = "Try to sit through the entire interview session to cover all technical categories.";
        } else if (avgAnswerLength < 15) {
            overallScore = 45;
            technicalScore = 40;
            communicationScore = 50;
            weaknesses.add("Candidate responses are extremely brief, short, or empty.");
            recommendations = "Explain your technical answers in more detail. Elaborate on structural solutions and patterns.";
        } else {
            overallScore = 75 + random.nextInt(15);
            technicalScore = 75 + random.nextInt(15);
            communicationScore = 80 + random.nextInt(15);
            strengths.add("Covers main parts of technical questions.");
            strengths.add("Clear dialogue communication.");
            weaknesses.add("Could expand on low-level design optimizations.");
            recommendations = "Review coding paradigms and practice detailing system constraints.";
        }

        return new EvaluateResponse(overallScore, technicalScore, communicationScore, strengths, weaknesses, recommendations);
    }
}

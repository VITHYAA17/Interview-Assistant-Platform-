package com.prepwise.controller;

import com.prepwise.dto.EvaluateRequest;
import com.prepwise.dto.EvaluateResponse;
import com.prepwise.dto.GenerateQuestionsRequest;
import com.prepwise.dto.GenerateQuestionsResponse;
import com.prepwise.service.EvaluationService;
import com.prepwise.service.QuestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AiController {

    private final QuestionService questionService;
    private final EvaluationService evaluationService;

    public AiController(QuestionService questionService, EvaluationService evaluationService) {
        this.questionService = questionService;
        this.evaluationService = evaluationService;
    }

    @PostMapping("/generate")
    public ResponseEntity<GenerateQuestionsResponse> generateQuestions(@RequestBody GenerateQuestionsRequest request) {
        GenerateQuestionsResponse response = questionService.generateQuestions(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/evaluate")
    public ResponseEntity<EvaluateResponse> evaluateInterview(@RequestBody EvaluateRequest request) {
        EvaluateResponse response = evaluationService.evaluateInterview(request);
        return ResponseEntity.ok(response);
    }
}

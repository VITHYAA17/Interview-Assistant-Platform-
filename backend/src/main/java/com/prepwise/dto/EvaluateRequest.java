package com.prepwise.dto;

import java.util.ArrayList;
import java.util.List;

public class EvaluateRequest {
    private String role;
    private String level;
    private String techStack;
    private Integer questionsCount;
    private List<TranscriptMessageDto> transcript = new ArrayList<>();

    public EvaluateRequest() {}

    public EvaluateRequest(String role, String level, String techStack, Integer questionsCount, List<TranscriptMessageDto> transcript) {
        this.role = role;
        this.level = level;
        this.techStack = techStack;
        this.questionsCount = questionsCount;
        this.transcript = transcript != null ? transcript : new ArrayList<>();
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getTechStack() {
        return techStack;
    }

    public void setTechStack(String techStack) {
        this.techStack = techStack;
    }

    public Integer getQuestionsCount() {
        return questionsCount != null ? questionsCount : 5;
    }

    public void setQuestionsCount(Integer questionsCount) {
        this.questionsCount = questionsCount;
    }

    public List<TranscriptMessageDto> getTranscript() {
        return transcript;
    }

    public void setTranscript(List<TranscriptMessageDto> transcript) {
        this.transcript = transcript != null ? transcript : new ArrayList<>();
    }
}

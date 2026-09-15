package com.prepwise.dto;

import java.util.List;

public class InterviewDto {
    private String id;
    private String role;
    private String level;
    private String techStack;
    private int questionsCount;
    private String createdAt;
    private String status;
    private List<TranscriptMessageDto> transcript;
    private EvaluateResponse feedback;

    public InterviewDto() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public int getQuestionsCount() {
        return questionsCount;
    }

    public void setQuestionsCount(int questionsCount) {
        this.questionsCount = questionsCount;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<TranscriptMessageDto> getTranscript() {
        return transcript;
    }

    public void setTranscript(List<TranscriptMessageDto> transcript) {
        this.transcript = transcript;
    }

    public EvaluateResponse getFeedback() {
        return feedback;
    }

    public void setFeedback(EvaluateResponse feedback) {
        this.feedback = feedback;
    }
}

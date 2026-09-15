package com.prepwise.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "interviews")
public class InterviewEntity {

    @Id
    private String id;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private String level;

    @Column(nullable = false)
    private String techStack;

    private int questionsCount = 5;

    @Column(nullable = false)
    private String createdAt = Instant.now().toString();

    @Column(nullable = false)
    private String status = "pending"; // "pending" or "completed"

    @Column(columnDefinition = "TEXT")
    private String transcriptJson;

    @Column(columnDefinition = "TEXT")
    private String feedbackJson;

    private Integer overallScore;
    private Integer technicalScore;
    private Integer communicationScore;

    public InterviewEntity() {}

    public InterviewEntity(String id, String role, String level, String techStack, int questionsCount) {
        this.id = id;
        this.role = role;
        this.level = level;
        this.techStack = techStack;
        this.questionsCount = questionsCount;
        this.createdAt = Instant.now().toString();
        this.status = "pending";
    }

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

    public String getTranscriptJson() {
        return transcriptJson;
    }

    public void setTranscriptJson(String transcriptJson) {
        this.transcriptJson = transcriptJson;
    }

    public String getFeedbackJson() {
        return feedbackJson;
    }

    public void setFeedbackJson(String feedbackJson) {
        this.feedbackJson = feedbackJson;
    }

    public Integer getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(Integer overallScore) {
        this.overallScore = overallScore;
    }

    public Integer getTechnicalScore() {
        return technicalScore;
    }

    public void setTechnicalScore(Integer technicalScore) {
        this.technicalScore = technicalScore;
    }

    public Integer getCommunicationScore() {
        return communicationScore;
    }

    public void setCommunicationScore(Integer communicationScore) {
        this.communicationScore = communicationScore;
    }
}

package com.prepwise.dto;

public class GenerateQuestionsRequest {
    private String role;
    private String level;
    private String techStack;
    private Integer questionsCount;

    public GenerateQuestionsRequest() {}

    public GenerateQuestionsRequest(String role, String level, String techStack, Integer questionsCount) {
        this.role = role;
        this.level = level;
        this.techStack = techStack;
        this.questionsCount = questionsCount;
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
}

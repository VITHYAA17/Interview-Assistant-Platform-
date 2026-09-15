package com.prepwise.dto;

import java.util.ArrayList;
import java.util.List;

public class EvaluateResponse {
    private int overallScore;
    private int technicalScore;
    private int communicationScore;
    private List<String> strengths = new ArrayList<>();
    private List<String> weaknesses = new ArrayList<>();
    private String recommendations;

    public EvaluateResponse() {}

    public EvaluateResponse(int overallScore, int technicalScore, int communicationScore,
                            List<String> strengths, List<String> weaknesses, String recommendations) {
        this.overallScore = overallScore;
        this.technicalScore = technicalScore;
        this.communicationScore = communicationScore;
        this.strengths = strengths != null ? strengths : new ArrayList<>();
        this.weaknesses = weaknesses != null ? weaknesses : new ArrayList<>();
        this.recommendations = recommendations;
    }

    public int getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(int overallScore) {
        this.overallScore = overallScore;
    }

    public int getTechnicalScore() {
        return technicalScore;
    }

    public void setTechnicalScore(int technicalScore) {
        this.technicalScore = technicalScore;
    }

    public int getCommunicationScore() {
        return communicationScore;
    }

    public void setCommunicationScore(int communicationScore) {
        this.communicationScore = communicationScore;
    }

    public List<String> getStrengths() {
        return strengths;
    }

    public void setStrengths(List<String> strengths) {
        this.strengths = strengths != null ? strengths : new ArrayList<>();
    }

    public List<String> getWeaknesses() {
        return weaknesses;
    }

    public void setWeaknesses(List<String> weaknesses) {
        this.weaknesses = weaknesses != null ? weaknesses : new ArrayList<>();
    }

    public String getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(String recommendations) {
        this.recommendations = recommendations;
    }
}

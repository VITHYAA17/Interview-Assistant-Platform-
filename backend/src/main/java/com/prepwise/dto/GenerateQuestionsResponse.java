package com.prepwise.dto;

import java.util.List;

public class GenerateQuestionsResponse {
    private List<String> questions;
    private boolean isMock;

    public GenerateQuestionsResponse() {}

    public GenerateQuestionsResponse(List<String> questions, boolean isMock) {
        this.questions = questions;
        this.isMock = isMock;
    }

    public List<String> getQuestions() {
        return questions;
    }

    public void setQuestions(List<String> questions) {
        this.questions = questions;
    }

    public boolean isMock() {
        return isMock;
    }

    public void setMock(boolean mock) {
        isMock = mock;
    }
}

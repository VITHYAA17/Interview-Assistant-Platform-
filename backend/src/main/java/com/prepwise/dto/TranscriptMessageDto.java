package com.prepwise.dto;

public class TranscriptMessageDto {
    private String role; // "user" or "assistant"
    private String text;
    private Boolean isFinal;

    public TranscriptMessageDto() {}

    public TranscriptMessageDto(String role, String text, Boolean isFinal) {
        this.role = role;
        this.text = text;
        this.isFinal = isFinal;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Boolean getIsFinal() {
        return isFinal;
    }

    public void setIsFinal(Boolean isFinal) {
        this.isFinal = isFinal;
    }
}

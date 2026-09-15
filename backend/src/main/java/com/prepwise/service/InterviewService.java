package com.prepwise.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prepwise.dto.EvaluateResponse;
import com.prepwise.dto.InterviewDto;
import com.prepwise.dto.TranscriptMessageDto;
import com.prepwise.model.InterviewEntity;
import com.prepwise.repository.InterviewRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InterviewService {

    private static final Logger logger = LoggerFactory.getLogger(InterviewService.class);

    private final InterviewRepository interviewRepository;
    private final ObjectMapper objectMapper;

    public InterviewService(InterviewRepository interviewRepository, ObjectMapper objectMapper) {
        this.interviewRepository = interviewRepository;
        this.objectMapper = objectMapper;
    }

    public List<InterviewDto> getAllInterviews() {
        return interviewRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .toList();
    }

    public Optional<InterviewDto> getInterviewById(String id) {
        return interviewRepository.findById(id).map(this::mapToDto);
    }

    public InterviewDto saveInterview(InterviewDto dto) {
        InterviewEntity entity = mapToEntity(dto);
        InterviewEntity saved = interviewRepository.save(entity);
        return mapToDto(saved);
    }

    public boolean deleteInterview(String id) {
        if (interviewRepository.existsById(id)) {
            interviewRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private InterviewDto mapToDto(InterviewEntity entity) {
        InterviewDto dto = new InterviewDto();
        dto.setId(entity.getId());
        dto.setRole(entity.getRole());
        dto.setLevel(entity.getLevel());
        dto.setTechStack(entity.getTechStack());
        dto.setQuestionsCount(entity.getQuestionsCount());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setStatus(entity.getStatus());

        try {
            if (entity.getTranscriptJson() != null && !entity.getTranscriptJson().isBlank()) {
                List<TranscriptMessageDto> transcript = objectMapper.readValue(
                        entity.getTranscriptJson(),
                        new TypeReference<List<TranscriptMessageDto>>() {}
                );
                dto.setTranscript(transcript);
            }
        } catch (Exception e) {
            logger.warn("Could not deserialize transcript JSON: {}", e.getMessage());
        }

        try {
            if (entity.getFeedbackJson() != null && !entity.getFeedbackJson().isBlank()) {
                EvaluateResponse feedback = objectMapper.readValue(entity.getFeedbackJson(), EvaluateResponse.class);
                dto.setFeedback(feedback);
            }
        } catch (Exception e) {
            logger.warn("Could not deserialize feedback JSON: {}", e.getMessage());
        }

        return dto;
    }

    private InterviewEntity mapToEntity(InterviewDto dto) {
        InterviewEntity entity = new InterviewEntity();
        entity.setId(dto.getId());
        entity.setRole(dto.getRole());
        entity.setLevel(dto.getLevel());
        entity.setTechStack(dto.getTechStack());
        entity.setQuestionsCount(dto.getQuestionsCount());
        entity.setCreatedAt(dto.getCreatedAt() != null ? dto.getCreatedAt() : java.time.Instant.now().toString());
        entity.setStatus(dto.getStatus() != null ? dto.getStatus() : "pending");

        if (dto.getFeedback() != null) {
            entity.setOverallScore(dto.getFeedback().getOverallScore());
            entity.setTechnicalScore(dto.getFeedback().getTechnicalScore());
            entity.setCommunicationScore(dto.getFeedback().getCommunicationScore());
            try {
                entity.setFeedbackJson(objectMapper.writeValueAsString(dto.getFeedback()));
            } catch (Exception e) {
                logger.warn("Could not serialize feedback to JSON: {}", e.getMessage());
            }
        }

        if (dto.getTranscript() != null) {
            try {
                entity.setTranscriptJson(objectMapper.writeValueAsString(dto.getTranscript()));
            } catch (Exception e) {
                logger.warn("Could not serialize transcript to JSON: {}", e.getMessage());
            }
        }

        return entity;
    }
}

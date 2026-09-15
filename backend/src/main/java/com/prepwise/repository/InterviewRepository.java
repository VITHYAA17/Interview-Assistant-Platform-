package com.prepwise.repository;

import com.prepwise.model.InterviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<InterviewEntity, String> {
    List<InterviewEntity> findAllByOrderByCreatedAtDesc();
}

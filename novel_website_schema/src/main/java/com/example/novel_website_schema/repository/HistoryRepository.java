package com.example.novel_website_schema.repository;

import com.example.novel_website_schema.entity.History;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;
 
public interface HistoryRepository extends JpaRepository<History, Integer> {
    Optional<History> findByUserIdAndStoryIdAndChapterId(Integer userId, Integer storyId, Integer chapterId);
    List<History> findByUserIdOrderByLastReadAtDesc(Integer userId);
    Long countByUserId(Integer userId);
} 
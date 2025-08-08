package com.example.novel_website_schema.repository;

import com.example.novel_website_schema.entity.UnlockedChapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UnlockedChapterRepository extends JpaRepository<UnlockedChapter, Integer> {
    
    List<UnlockedChapter> findByUserIdOrderByUnlockedAtDesc(Integer userId);
    
    Optional<UnlockedChapter> findByUserIdAndChapterId(Integer userId, Integer chapterId);
    
    boolean existsByUserIdAndChapterId(Integer userId, Integer chapterId);
    
    List<UnlockedChapter> findByUserIdAndChapterStoryId(Integer userId, Integer storyId);
} 
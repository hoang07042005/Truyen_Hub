package com.example.novel_website_schema.repository;

import com.example.novel_website_schema.entity.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Integer> {
    
    @Query("SELECT COUNT(c) FROM Chapter c WHERE c.storyId = :storyId")
    Integer countByStoryId(@Param("storyId") Integer storyId);
    
    Optional<Chapter> findFirstByStoryIdOrderByChapterNumberDesc(Integer storyId);
    
    List<Chapter> findByStoryId(Integer storyId);
    
    List<Chapter> findByStoryIdOrderByChapterNumberAsc(Integer storyId);
} 
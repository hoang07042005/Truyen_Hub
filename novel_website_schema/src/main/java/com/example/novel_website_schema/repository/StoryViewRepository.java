package com.example.novel_website_schema.repository;

import com.example.novel_website_schema.entity.StoryView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface StoryViewRepository extends JpaRepository<StoryView, Integer> {
    
    // Lấy tất cả view của một story
    List<StoryView> findByStoryId(Integer storyId);
    
    // Đếm số view của một story
    long countByStoryId(Integer storyId);
    
    // Lấy view của user cho story
    List<StoryView> findByUserIdAndStoryId(Integer userId, Integer storyId);
    
    // Lấy view theo IP address
    List<StoryView> findByIpAddressAndStoryId(String ipAddress, Integer storyId);
    
    // Đếm view unique (theo user hoặc IP)
    @Query("SELECT COUNT(DISTINCT CASE WHEN sv.userId IS NOT NULL THEN sv.userId ELSE sv.ipAddress END) FROM StoryView sv WHERE sv.storyId = :storyId")
    long countUniqueViewsByStoryId(@Param("storyId") Integer storyId);
} 
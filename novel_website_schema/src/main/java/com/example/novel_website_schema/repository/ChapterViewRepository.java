package com.example.novel_website_schema.repository;

import com.example.novel_website_schema.entity.ChapterView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ChapterViewRepository extends JpaRepository<ChapterView, Integer> {
    
    // Lấy tất cả view của một chapter
    List<ChapterView> findByChapterId(Integer chapterId);
    
    // Đếm số view của một chapter
    long countByChapterId(Integer chapterId);
    
    // Lấy view của user cho chapter
    List<ChapterView> findByUserIdAndChapterId(Integer userId, Integer chapterId);
    
    // Lấy view theo IP address
    List<ChapterView> findByIpAddressAndChapterId(String ipAddress, Integer chapterId);
    
    // Đếm view unique (theo user hoặc IP)
    @Query("SELECT COUNT(DISTINCT CASE WHEN cv.userId IS NOT NULL THEN cv.userId ELSE cv.ipAddress END) FROM ChapterView cv WHERE cv.chapterId = :chapterId")
    long countUniqueViewsByChapterId(@Param("chapterId") Integer chapterId);
} 
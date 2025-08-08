package com.example.novel_website_schema.repository;

import com.example.novel_website_schema.entity.ChapterLike;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ChapterLikeRepository extends JpaRepository<ChapterLike, Integer> {
    
    // Tìm like của user cho chapter
    Optional<ChapterLike> findByUserIdAndChapterId(Integer userId, Integer chapterId);
    
    // Kiểm tra user đã like chapter chưa
    boolean existsByUserIdAndChapterId(Integer userId, Integer chapterId);
    
    // Lấy tất cả like của một chapter
    List<ChapterLike> findByChapterId(Integer chapterId);
    
    // Đếm số like của một chapter
    long countByChapterId(Integer chapterId);
    
    // Xóa like của user cho chapter
    @org.springframework.transaction.annotation.Transactional
    void deleteByUserIdAndChapterId(Integer userId, Integer chapterId);
} 
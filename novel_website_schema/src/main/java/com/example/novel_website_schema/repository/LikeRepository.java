package com.example.novel_website_schema.repository;

import com.example.novel_website_schema.entity.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Integer> {
    
    // Tìm like của user cho story
    Optional<Like> findByUserIdAndStoryId(Integer userId, Integer storyId);
    
    // Kiểm tra user đã like story chưa
    boolean existsByUserIdAndStoryId(Integer userId, Integer storyId);
    
    // Lấy tất cả like của một story
    List<Like> findByStoryId(Integer storyId);
    
    // Đếm số like của một story
    long countByStoryId(Integer storyId);
    
    // Xóa like của user cho story
    @org.springframework.transaction.annotation.Transactional
    void deleteByUserIdAndStoryId(Integer userId, Integer storyId);
} 
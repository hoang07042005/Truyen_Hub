package com.example.novel_website_schema.repository;

import com.example.novel_website_schema.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Integer> {
    
    // Tìm rating của user cho story
    Optional<Rating> findByUserIdAndStoryId(Integer userId, Integer storyId);
    
    // Lấy tất cả rating của một story
    List<Rating> findByStoryId(Integer storyId);
    
    // Đếm số rating của một story
    long countByStoryId(Integer storyId);
    
    // Tính điểm trung bình của story
    @Query("SELECT AVG(r.rating) FROM Rating r WHERE r.storyId = :storyId")
    Double getAverageRatingByStoryId(@Param("storyId") Integer storyId);
    
    // Lấy rating với thông tin user
    @Query("SELECT r FROM Rating r JOIN FETCH r.user WHERE r.storyId = :storyId ORDER BY r.createdAt DESC")
    List<Rating> findByStoryIdWithUser(@Param("storyId") Integer storyId);
    
    // Xóa rating của user cho story
    @org.springframework.transaction.annotation.Transactional
    void deleteByUserIdAndStoryId(Integer userId, Integer storyId);
} 
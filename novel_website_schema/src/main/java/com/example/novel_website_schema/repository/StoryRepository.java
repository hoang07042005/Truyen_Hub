package com.example.novel_website_schema.repository;

import com.example.novel_website_schema.entity.Story;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StoryRepository extends JpaRepository<Story, Integer> {
    
    Page<Story> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(
            String title, String author, Pageable pageable);
    
    @Query("SELECT DISTINCT s FROM Story s JOIN s.categories c WHERE c.id = :categoryId")
    Page<Story> findByCategoryId(@Param("categoryId") Integer categoryId, Pageable pageable);
    
    @Query("SELECT DISTINCT s FROM Story s JOIN s.categories c WHERE c.name = :categoryName")
    Page<Story> findByCategoryName(@Param("categoryName") String categoryName, Pageable pageable);
    
    @Query("SELECT s FROM Story s ORDER BY s.createdAt DESC")
    List<Story> findTopByOrderByCreatedAtDesc(int limit);
    
    @Query("SELECT s FROM Story s ORDER BY s.views DESC")
    List<Story> findTopByOrderByViewsDesc(int limit);
    
    // Custom query để sort theo rating
    @Query("SELECT s FROM Story s LEFT JOIN Rating r ON s.id = r.storyId GROUP BY s.id ORDER BY AVG(r.rating) DESC NULLS LAST")
    List<Story> findTopByOrderByRatingDesc(int limit);
    
    // Custom query để sort theo like count
    @Query("SELECT s FROM Story s LEFT JOIN Like l ON s.id = l.storyId GROUP BY s.id ORDER BY COUNT(l.id) DESC NULLS LAST")
    List<Story> findTopByOrderByLikeCountDesc(int limit);
} 
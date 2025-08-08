package com.example.novel_website_schema.repository;

import com.example.novel_website_schema.entity.StoryCategory;
import com.example.novel_website_schema.entity.StoryCategoryId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface StoryCategoryRepository extends JpaRepository<StoryCategory, StoryCategoryId> {
    
    @Query("SELECT COUNT(DISTINCT sc.storyId) FROM StoryCategory sc")
    Long countDistinctStoryIds();
    
    @Query("SELECT COUNT(sc) FROM StoryCategory sc WHERE sc.categoryId = :categoryId")
    Long countByCategoryId(@Param("categoryId") Integer categoryId);
}
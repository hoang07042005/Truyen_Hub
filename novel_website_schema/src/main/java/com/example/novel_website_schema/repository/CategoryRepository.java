package com.example.novel_website_schema.repository;

import com.example.novel_website_schema.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    
    @Query("SELECT c.name FROM Category c JOIN StoryCategory sc ON c.id = sc.categoryId GROUP BY c.id, c.name ORDER BY COUNT(sc.storyId) DESC LIMIT 1")
    String findMostPopularCategory();
    
    @Query("SELECT c FROM Category c WHERE c.name IN :names")
    List<Category> findByNameIn(@Param("names") List<String> names);
} 
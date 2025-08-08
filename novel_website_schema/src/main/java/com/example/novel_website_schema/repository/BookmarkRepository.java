package com.example.novel_website_schema.repository;

import com.example.novel_website_schema.entity.Bookmark;
import com.example.novel_website_schema.entity.User;
import com.example.novel_website_schema.entity.Story;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface BookmarkRepository extends JpaRepository<Bookmark, Integer> {
    boolean existsByUserIdAndStoryId(Integer userId, Integer storyId);
    void deleteByUserIdAndStoryId(Integer userId, Integer storyId);
    List<Bookmark> findByUserId(Integer userId);
} 
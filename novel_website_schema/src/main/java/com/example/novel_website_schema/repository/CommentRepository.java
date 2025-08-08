package com.example.novel_website_schema.repository;

import com.example.novel_website_schema.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Integer> {
    List<Comment> findByChapterIdOrderByCreatedAtDesc(Integer chapterId);
    List<Comment> findByStoryIdOrderByCreatedAtDesc(Integer storyId);
} 
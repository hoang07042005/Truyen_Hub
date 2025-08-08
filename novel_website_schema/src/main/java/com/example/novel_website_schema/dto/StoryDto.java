package com.example.novel_website_schema.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StoryDto {
    private Integer id;
    private String title;
    private String slug;
    private String author;
    private String description;
    private String coverImage;
    private String status;
    private Integer views;
    private Integer viewCount; // From story_views table
    private Integer likeCount; // From likes table
    private Integer ratingCount; // From ratings table
    private Double averageRating; // From ratings table
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> categories;
    private Integer chapterCount;
    private String lastChapterTitle;
    private LocalDateTime lastChapterDate;
} 
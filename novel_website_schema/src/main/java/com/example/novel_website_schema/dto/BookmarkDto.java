package com.example.novel_website_schema.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookmarkDto {
    private Integer id;
    private Integer userId;
    private Integer storyId;
    private Integer chapterId;
    private LocalDateTime createdAt;
} 
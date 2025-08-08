package com.example.novel_website_schema.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "chapters")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Chapter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "story_id", nullable = false)
    private Integer storyId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 255)
    private String slug;

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String content;

    private Integer views = 0;

    @Column(name = "is_locked", nullable = false)
    private Boolean isLocked = false;

    @Column(name = "coins_required", nullable = false)
    private Integer coinsRequired = 10;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "chapter_number", nullable = false)
    private Integer chapterNumber;
} 
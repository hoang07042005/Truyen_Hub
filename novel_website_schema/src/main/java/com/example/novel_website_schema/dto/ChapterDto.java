package com.example.novel_website_schema.dto;

import java.time.LocalDateTime;

public class ChapterDto {
    private Integer id;
    private Integer storyId;
    private String title;
    private String slug;
    private String content;
    private Integer views;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer chapterNumber;
    private Boolean isLocked;
    private Integer coinsRequired;

    // Constructors
    public ChapterDto() {}

    public ChapterDto(Integer id, Integer storyId, String title, String slug, String content, 
                     Integer views, LocalDateTime createdAt, LocalDateTime updatedAt, Integer chapterNumber,
                     Boolean isLocked, Integer coinsRequired) {
        this.id = id;
        this.storyId = storyId;
        this.title = title;
        this.slug = slug;
        this.content = content;
        this.views = views;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.chapterNumber = chapterNumber;
        this.isLocked = isLocked;
        this.coinsRequired = coinsRequired;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getStoryId() {
        return storyId;
    }

    public void setStoryId(Integer storyId) {
        this.storyId = storyId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Integer getViews() {
        return views;
    }

    public void setViews(Integer views) {
        this.views = views;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Integer getChapterNumber() {
        return chapterNumber;
    }

    public void setChapterNumber(Integer chapterNumber) {
        this.chapterNumber = chapterNumber;
    }

    public Boolean getIsLocked() {
        return isLocked;
    }

    public void setIsLocked(Boolean isLocked) {
        this.isLocked = isLocked;
    }

    public Integer getCoinsRequired() {
        return coinsRequired;
    }

    public void setCoinsRequired(Integer coinsRequired) {
        this.coinsRequired = coinsRequired;
    }
} 
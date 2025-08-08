package com.example.novel_website_schema.dto;

public class StoryStatsDto {
    private Integer storyId;
    private Long likeCount;
    private Long ratingCount;
    private Double averageRating;
    private Long viewCount;

    public StoryStatsDto() {}

    public StoryStatsDto(Integer storyId, Long likeCount, Long ratingCount, Double averageRating, Long viewCount) {
        this.storyId = storyId;
        this.likeCount = likeCount;
        this.ratingCount = ratingCount;
        this.averageRating = averageRating;
        this.viewCount = viewCount;
    }

    public Integer getStoryId() {
        return storyId;
    }

    public void setStoryId(Integer storyId) {
        this.storyId = storyId;
    }

    public Long getLikeCount() {
        return likeCount;
    }

    public void setLikeCount(Long likeCount) {
        this.likeCount = likeCount;
    }

    public Long getRatingCount() {
        return ratingCount;
    }

    public void setRatingCount(Long ratingCount) {
        this.ratingCount = ratingCount;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Long getViewCount() {
        return viewCount;
    }

    public void setViewCount(Long viewCount) {
        this.viewCount = viewCount;
    }
} 
package com.example.novel_website_schema.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activities")
public class Activity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false)
    private ActivityType activityType;
    
    @Column(name = "message", nullable = false, length = 500)
    private String message;
    
    @Column(name = "user_id")
    private Integer userId;
    
    @Column(name = "story_id")
    private Integer storyId;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "ip_address")
    private String ipAddress;
    
    @Column(name = "user_agent")
    private String userAgent;
    
    public enum ActivityType {
        USER_REGISTRATION,
        USER_LOGIN,
        STORY_CREATED,
        STORY_UPDATED,
        STORY_APPROVED,
        STORY_REJECTED,
        STORY_REPORTED,
        VIEW_STORY,
        CHAPTER_ADDED,
        COMMENT_ADDED,
        RATING_ADDED,
        LIKE_ADDED,
        BOOKMARK_ADDED,
        PASSWORD_CHANGED,
        PROFILE_UPDATED
    }
    
    // Constructors
    public Activity() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Activity(ActivityType activityType, String message) {
        this();
        this.activityType = activityType;
        this.message = message;
    }
    
    public Activity(ActivityType activityType, String message, Integer userId) {
        this(activityType, message);
        this.userId = userId;
    }
    
    public Activity(ActivityType activityType, String message, Integer userId, Integer storyId) {
        this(activityType, message, userId);
        this.storyId = storyId;
    }
    
    // Getters and Setters
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public ActivityType getActivityType() {
        return activityType;
    }
    
    public void setActivityType(ActivityType activityType) {
        this.activityType = activityType;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public Integer getUserId() {
        return userId;
    }
    
    public void setUserId(Integer userId) {
        this.userId = userId;
    }
    
    public Integer getStoryId() {
        return storyId;
    }
    
    public void setStoryId(Integer storyId) {
        this.storyId = storyId;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getIpAddress() {
        return ipAddress;
    }
    
    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
    
    public String getUserAgent() {
        return userAgent;
    }
    
    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }
} 
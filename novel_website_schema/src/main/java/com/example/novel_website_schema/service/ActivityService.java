package com.example.novel_website_schema.service;

import com.example.novel_website_schema.entity.Activity;
import com.example.novel_website_schema.repository.ActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ActivityService {
    
    @Autowired
    private ActivityRepository activityRepository;
    
    // Log a new activity
    public Activity logActivity(Activity.ActivityType activityType, String message) {
        Activity activity = new Activity(activityType, message);
        return activityRepository.save(activity);
    }
    
    // Log activity with user
    public Activity logActivity(Activity.ActivityType activityType, String message, Integer userId) {
        Activity activity = new Activity(activityType, message, userId);
        return activityRepository.save(activity);
    }
    
    // Log activity with user and story
    public Activity logActivity(Activity.ActivityType activityType, String message, Integer userId, Integer storyId) {
        Activity activity = new Activity(activityType, message, userId, storyId);
        return activityRepository.save(activity);
    }
    
    // Get recent activities for admin dashboard
    public List<Map<String, Object>> getRecentActivitiesForDashboard(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        Page<Activity> activities = activityRepository.findAllByOrderByCreatedAtDesc(pageable);
        
        return activities.getContent().stream()
                .map(this::convertToDashboardFormat)
                .collect(Collectors.toList());
    }
    
    // Get activities from last 24 hours
    public List<Map<String, Object>> getRecentActivities(int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        List<Activity> activities = activityRepository.findRecentActivities(since);
        
        return activities.stream()
                .map(this::convertToDashboardFormat)
                .collect(Collectors.toList());
    }
    
    // Convert activity to dashboard format
    private Map<String, Object> convertToDashboardFormat(Activity activity) {
        Map<String, Object> result = new HashMap<>();
        
        // Set activity type for color coding
        result.put("type", getActivityTypeForDisplay(activity.getActivityType()));
        result.put("message", activity.getMessage());
        result.put("time", formatTimeAgo(activity.getCreatedAt()));
        
        return result;
    }
    
    // Map activity type to display type
    private String getActivityTypeForDisplay(Activity.ActivityType activityType) {
        switch (activityType) {
            case USER_REGISTRATION:
            case USER_LOGIN:
                return "user";
            case STORY_CREATED:
            case STORY_UPDATED:
            case STORY_APPROVED:
            case STORY_REJECTED:
            case CHAPTER_ADDED:
                return "approval";
            case STORY_REPORTED:
                return "report";
            case COMMENT_ADDED:
                return "comment";
            case RATING_ADDED:
                return "rating";
            case LIKE_ADDED:
            case BOOKMARK_ADDED:
                return "pending";
            default:
                return "pending";
        }
    }
    
    // Format time ago
    private String formatTimeAgo(LocalDateTime createdAt) {
        LocalDateTime now = LocalDateTime.now();
        long minutes = java.time.Duration.between(createdAt, now).toMinutes();
        
        if (minutes < 1) {
            return "Vừa xong";
        } else if (minutes < 60) {
            return minutes + " phút trước";
        } else {
            long hours = minutes / 60;
            if (hours < 24) {
                return hours + " giờ trước";
            } else {
                long days = hours / 24;
                return days + " ngày trước";
            }
        }
    }
    
    // Get activity statistics
    public Map<String, Object> getActivityStats() {
        Map<String, Object> stats = new HashMap<>();
        
        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
        LocalDateTime last7Days = LocalDateTime.now().minusDays(7);
        
        // Count activities in last 24 hours
        List<Activity> recentActivities = activityRepository.findRecentActivities(last24Hours);
        stats.put("last24Hours", recentActivities.size());
        
        // Count activities in last 7 days
        List<Activity> weeklyActivities = activityRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(
                last7Days, LocalDateTime.now());
        stats.put("last7Days", weeklyActivities.size());
        
        // Count by type
        stats.put("userRegistrations", activityRepository.countByActivityType(Activity.ActivityType.USER_REGISTRATION));
        stats.put("storyCreations", activityRepository.countByActivityType(Activity.ActivityType.STORY_CREATED));
        stats.put("storyApprovals", activityRepository.countByActivityType(Activity.ActivityType.STORY_APPROVED));
        stats.put("reports", activityRepository.countByActivityType(Activity.ActivityType.STORY_REPORTED));
        
        return stats;
    }
} 
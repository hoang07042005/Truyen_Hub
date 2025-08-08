package com.example.novel_website_schema.repository;

import com.example.novel_website_schema.entity.Activity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Integer> {
    
    // Find recent activities with pagination
    Page<Activity> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    // Find activities by type
    List<Activity> findByActivityTypeOrderByCreatedAtDesc(Activity.ActivityType activityType);
    
    // Find activities by user
    List<Activity> findByUserIdOrderByCreatedAtDesc(Integer userId);
    
    // Find activities by story
    List<Activity> findByStoryIdOrderByCreatedAtDesc(Integer storyId);
    
    // Find activities within a time range
    List<Activity> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);
    
    // Find recent activities (last 24 hours)
    @Query("SELECT a FROM Activity a WHERE a.createdAt >= :since ORDER BY a.createdAt DESC")
    List<Activity> findRecentActivities(LocalDateTime since);
    
    // Count activities by type
    long countByActivityType(Activity.ActivityType activityType);
    
    // Count activities by user
    long countByUserId(Integer userId);
    
    // Count activities by story
    long countByStoryId(Integer storyId);
    
    // Find activities with user information (for admin dashboard)
    @Query("SELECT a FROM Activity a LEFT JOIN User u ON a.userId = u.id ORDER BY a.createdAt DESC")
    Page<Activity> findActivitiesWithUserInfo(Pageable pageable);
} 
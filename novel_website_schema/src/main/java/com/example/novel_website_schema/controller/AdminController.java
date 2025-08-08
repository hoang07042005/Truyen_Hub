package com.example.novel_website_schema.controller;

import com.example.novel_website_schema.dto.StoryDto;
import com.example.novel_website_schema.service.StoryService;
import com.example.novel_website_schema.service.UserService;
import com.example.novel_website_schema.service.StatsService;
import com.example.novel_website_schema.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private StoryService storyService;

    @Autowired
    private UserService userService;

    @Autowired
    private StatsService statsService;

    @Autowired
    private ActivityService activityService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Get total stories count
            long totalStories = storyService.getTotalStoriesCount();
            
            // Get active users count (users who logged in within last 30 days)
            long activeUsers = userService.getActiveUsersCount();
            
            // Get daily reads (views from today)
            long dailyReads = statsService.getDailyReads();
            
            // Get monthly revenue (mock data for now)
            long monthlyRevenue = 0; // TODO: Implement revenue tracking
            
            stats.put("totalStories", totalStories);
            stats.put("activeUsers", activeUsers);
            stats.put("dailyReads", dailyReads);
            stats.put("monthlyRevenue", monthlyRevenue);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Không thể lấy thống kê dashboard");
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/activities")
    public ResponseEntity<List<Map<String, Object>>> getRecentActivities() {
        try {
            // Get recent activities from ActivityService (limit to 5)
            List<Map<String, Object>> activities = activityService.getRecentActivitiesForDashboard(5);
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(List.of());
        }
    }

    @GetMapping("/top-stories")
    public ResponseEntity<List<StoryDto>> getTopStories() {
        try {
            // Get top 5 stories by view count
            List<StoryDto> topStories = storyService.getTopStoriesByViews(5);
            return ResponseEntity.ok(topStories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(List.of());
        }
    }
} 
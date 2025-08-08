package com.example.novel_website_schema.controller;

import com.example.novel_website_schema.entity.*;
import com.example.novel_website_schema.repository.*;
import com.example.novel_website_schema.service.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/statistics")
@CrossOrigin(origins = "*")
public class AdminStatisticsController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StoryRepository storyRepository;

    @Autowired
    private ChapterRepository chapterRepository;

    @Autowired
    private StoryViewRepository storyViewRepository;

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserCoinsRepository userCoinsRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getStatistics(
            @RequestParam(defaultValue = "week") String timeRange,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Map<String, Object> statistics = new HashMap<>();
        
        try {
            LocalDateTime startDate = getStartDate(timeRange);
            
            // User statistics
            long totalUsers = userRepository.count();
            long newUsers = userRepository.findAll().stream()
                    .filter(user -> user.getCreatedAt() != null && user.getCreatedAt().isAfter(startDate))
                    .count();
            
            // Story statistics
            long totalStories = storyRepository.count();
            long newStories = storyRepository.findAll().stream()
                    .filter(story -> story.getCreatedAt() != null && story.getCreatedAt().isAfter(startDate))
                    .count();
            
            // Chapter statistics
            long totalChapters = chapterRepository.count();
            long newChapters = chapterRepository.findAll().stream()
                    .filter(chapter -> chapter.getCreatedAt() != null && chapter.getCreatedAt().isAfter(startDate))
                    .count();
            
            // View statistics
            long totalViews = storyViewRepository.count();
            long newViews = storyViewRepository.findAll().stream()
                    .filter(view -> view.getViewedAt() != null && view.getViewedAt().isAfter(startDate))
                    .count();
            
            // Like statistics
            long totalLikes = likeRepository.count();
            long newLikes = likeRepository.findAll().stream()
                    .filter(like -> like.getCreatedAt() != null && like.getCreatedAt().isAfter(startDate))
                    .count();
            
            // Comment statistics
            long totalComments = commentRepository.count();
            long newComments = commentRepository.findAll().stream()
                    .filter(comment -> comment.getCreatedAt() != null && comment.getCreatedAt().isAfter(startDate))
                    .count();
            
            // Coin statistics
            long totalCoins = userCoinsRepository.findAll().stream()
                    .mapToLong(UserCoins::getCoins)
                    .sum();
            
            // Revenue statistics (from completed payments)
            BigDecimal totalRevenue = paymentRepository.findByPaymentStatus(Payment.PaymentStatus.COMPLETED)
                    .stream()
                    .map(Payment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            statistics.put("totalUsers", totalUsers);
            statistics.put("newUsers", newUsers);
            statistics.put("totalStories", totalStories);
            statistics.put("newStories", newStories);
            statistics.put("totalChapters", totalChapters);
            statistics.put("newChapters", newChapters);
            statistics.put("totalViews", totalViews);
            statistics.put("newViews", newViews);
            statistics.put("totalLikes", totalLikes);
            statistics.put("newLikes", newLikes);
            statistics.put("totalComments", totalComments);
            statistics.put("newComments", newComments);
            statistics.put("totalCoins", totalCoins);
            statistics.put("totalRevenue", totalRevenue);
            
            return ResponseEntity.ok(statistics);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Có lỗi xảy ra khi lấy thống kê"));
        }
    }

    @GetMapping("/top-stories")
    public ResponseEntity<List<Map<String, Object>>> getTopStories(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        try {
            List<Story> allStories = storyRepository.findAll();
            List<Story> topStories = allStories.stream()
                    .sorted((s1, s2) -> Integer.compare(s2.getViews(), s1.getViews()))
                    .limit(5)
                    .collect(Collectors.toList());
            
            List<Map<String, Object>> result = topStories.stream()
                    .map(story -> {
                        Map<String, Object> storyData = new HashMap<>();
                        storyData.put("id", story.getId());
                        storyData.put("title", story.getTitle());
                        storyData.put("author", story.getAuthor());
                        storyData.put("coverImage", story.getCoverImage());
                        storyData.put("views", story.getViews());
                        storyData.put("likes", 0); // Placeholder - implement when needed
                        storyData.put("comments", 0); // Placeholder - implement when needed
                        return storyData;
                    })
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/recent-activities")
    public ResponseEntity<List<Map<String, Object>>> getRecentActivities(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        try {
            // Placeholder - return empty list for now
            List<Map<String, Object>> result = new ArrayList<>();
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/popular-categories")
    public ResponseEntity<List<Map<String, Object>>> getPopularCategories(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        try {
            List<Category> allCategories = categoryRepository.findAll();
            long totalStories = storyRepository.count();
            
            List<Map<String, Object>> result = allCategories.stream()
                    .map(category -> {
                        // Count stories that have this category
                        long storyCount = storyRepository.findAll().stream()
                                .filter(story -> story.getCategories() != null && 
                                        story.getCategories().contains(category))
                                .count();
                        double percentage = totalStories > 0 ? (double) storyCount / totalStories * 100 : 0;
                        
                        Map<String, Object> categoryData = new HashMap<>();
                        categoryData.put("id", category.getId());
                        categoryData.put("name", category.getName());
                        categoryData.put("storyCount", storyCount);
                        categoryData.put("percentage", Math.round(percentage * 10.0) / 10.0); // Round to 1 decimal
                        return categoryData;
                    })
                    .filter(cat -> (Double) cat.get("percentage") > 0)
                    .sorted((a, b) -> Double.compare((Double) b.get("percentage"), (Double) a.get("percentage")))
                    .limit(7)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/revenue-chart")
    public ResponseEntity<Map<String, Object>> getRevenueChart(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        try {
            // Get current year
            int currentYear = LocalDateTime.now().getYear();
            
            // Generate monthly revenue data for current year
            List<String> labels = new ArrayList<>();
            List<BigDecimal> data = new ArrayList<>();
            
            for (int month = 1; month <= 12; month++) {
                labels.add("T" + month);
                
                // Calculate revenue for each month from completed payments
                LocalDateTime startOfMonth = LocalDateTime.of(currentYear, month, 1, 0, 0);
                LocalDateTime endOfMonth = startOfMonth.plusMonths(1).minusSeconds(1);
                
                BigDecimal monthlyRevenue = paymentRepository.findAll().stream()
                    .filter(payment -> payment.getPaymentStatus() == Payment.PaymentStatus.COMPLETED)
                    .filter(payment -> payment.getCompletedAt() != null)
                    .filter(payment -> payment.getCompletedAt().isAfter(startOfMonth) && payment.getCompletedAt().isBefore(endOfMonth))
                    .map(Payment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                
                data.add(monthlyRevenue);
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("labels", labels);
            result.put("data", data);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    private LocalDateTime getStartDate(String timeRange) {
        LocalDateTime now = LocalDateTime.now();
        switch (timeRange.toLowerCase()) {
            case "week":
                return now.minus(7, ChronoUnit.DAYS);
            case "month":
                return now.minus(30, ChronoUnit.DAYS);
            case "year":
                return now.minus(365, ChronoUnit.DAYS);
            default:
                return now.minus(7, ChronoUnit.DAYS);
        }
    }
} 
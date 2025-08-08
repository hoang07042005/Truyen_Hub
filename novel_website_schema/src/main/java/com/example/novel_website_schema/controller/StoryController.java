package com.example.novel_website_schema.controller;

import com.example.novel_website_schema.dto.StoryDto;
import com.example.novel_website_schema.dto.StoryStatsDto;
import com.example.novel_website_schema.service.StoryService;
import com.example.novel_website_schema.service.StatsService;
import com.example.novel_website_schema.service.ViewService;
import com.example.novel_website_schema.service.CustomUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stories")
@CrossOrigin(origins = "http://localhost:3000")
public class StoryController {
    
    @Autowired
    private StoryService storyService;
    
    @Autowired
    private StatsService statsService;
    
    @Autowired
    private ViewService viewService;

    @GetMapping
    public ResponseEntity<Page<StoryDto>> getAllStories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<StoryDto> stories = storyService.getAllStories(pageable);
        return ResponseEntity.ok(stories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StoryDto> getStoryById(
            @PathVariable Integer id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request) {
        StoryDto story = storyService.getStoryById(id);
        
        // Record view
        Integer userId = userDetails != null ? userDetails.getUserId() : null;
        viewService.recordStoryView(id, userId, request);
        
        return ResponseEntity.ok(story);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<StoryDto>> searchStories(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<StoryDto> stories = storyService.searchStories(keyword, pageable);
        return ResponseEntity.ok(stories);
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<Page<StoryDto>> getStoriesByCategory(
            @PathVariable Integer categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<StoryDto> stories = storyService.getStoriesByCategory(categoryId, pageable);
        return ResponseEntity.ok(stories);
    }

    @GetMapping("/latest")
    public ResponseEntity<List<StoryDto>> getLatestStories(@RequestParam(defaultValue = "6") int limit) {
        List<StoryDto> stories = storyService.getLatestStories(limit);
        return ResponseEntity.ok(stories);
    }

    @GetMapping("/popular")
    public ResponseEntity<List<StoryDto>> getPopularStories(@RequestParam(defaultValue = "6") int limit) {
        List<StoryDto> stories = storyService.getPopularStories(limit);
        return ResponseEntity.ok(stories);
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<StoryStatsDto> getStoryStats(@PathVariable Integer id) {
        try {
            StoryStatsDto stats = statsService.getStoryStats(id);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 
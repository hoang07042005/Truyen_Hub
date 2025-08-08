package com.example.novel_website_schema.controller;

import com.example.novel_website_schema.dto.StoryDto;
import com.example.novel_website_schema.entity.Story;
import com.example.novel_website_schema.service.StoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/stories")
@CrossOrigin(origins = "*")
public class AdminStoryController {

    @Autowired
    private StoryService storyService;

    // Get all stories with pagination and search
    @GetMapping
    public ResponseEntity<Page<StoryDto>> getAllStories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        
        String sortField = sort.split(",")[0];
        org.springframework.data.domain.Sort.Direction sortDirection = 
            sort.split(",").length > 1 && sort.split(",")[1].equals("desc") ? 
                org.springframework.data.domain.Sort.Direction.DESC : 
                org.springframework.data.domain.Sort.Direction.ASC;
        
        Pageable pageable = PageRequest.of(page, size, 
            org.springframework.data.domain.Sort.by(sortDirection, sortField));
        
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(storyService.searchStories(search, pageable));
        } else if (status != null && !status.trim().isEmpty()) {
            // Filter by status - you might need to implement this in StoryService
            return ResponseEntity.ok(storyService.getAllStories(pageable));
        } else if (category != null && !category.trim().isEmpty()) {
            return ResponseEntity.ok(storyService.getStoriesByCategoryName(category, pageable));
        } else {
            return ResponseEntity.ok(storyService.getAllStories(pageable));
        }
    }

    // Get story by ID
    @GetMapping("/{id}")
    public ResponseEntity<StoryDto> getStoryById(@PathVariable Integer id) {
        try {
            StoryDto story = storyService.getStoryById(id);
            return ResponseEntity.ok(story);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Create new story
    @PostMapping
    public ResponseEntity<StoryDto> createStory(
            @RequestParam("title") String title,
            @RequestParam(value = "author", required = false) String author,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("status") String status,
            @RequestParam(value = "categories", required = false) List<String> categories,
            @RequestParam(value = "coverImage", required = false) MultipartFile coverImage) {
        try {
            StoryDto storyDto = new StoryDto();
            storyDto.setTitle(title);
            storyDto.setAuthor(author);
            storyDto.setDescription(description);
            storyDto.setStatus(status);
            storyDto.setCategories(categories);
            
            StoryDto createdStory = storyService.createStory(storyDto, coverImage);
            return ResponseEntity.ok(createdStory);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // Update story
    @PutMapping("/{id}")
    public ResponseEntity<StoryDto> updateStory(
            @PathVariable Integer id,
            @RequestParam("title") String title,
            @RequestParam(value = "author", required = false) String author,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("status") String status,
            @RequestParam(value = "categories", required = false) List<String> categories,
            @RequestParam(value = "coverImage", required = false) MultipartFile coverImage) {
        try {
            StoryDto storyDto = new StoryDto();
            storyDto.setTitle(title);
            storyDto.setAuthor(author);
            storyDto.setDescription(description);
            storyDto.setStatus(status);
            storyDto.setCategories(categories);
            
            StoryDto updatedStory = storyService.updateStory(id, storyDto, coverImage);
            return ResponseEntity.ok(updatedStory);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // Delete story endpoint
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStory(@PathVariable Integer id) {
        try {
            storyService.deleteStory(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Lỗi khi xóa truyện: " + e.getMessage());
        }
    }

    // Update story status
    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStoryStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> statusUpdate) {
        try {
            String newStatus = statusUpdate.get("status");
            storyService.updateStoryStatus(id, newStatus);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get story statistics
    @GetMapping("/{id}/stats")
    public ResponseEntity<Map<String, Object>> getStoryStats(@PathVariable Integer id) {
        try {
            StoryDto story = storyService.getStoryById(id);
            Map<String, Object> stats = Map.of(
                "viewCount", story.getViewCount(),
                "likeCount", story.getLikeCount(),
                "ratingCount", story.getRatingCount(),
                "averageRating", story.getAverageRating(),
                "chapterCount", story.getChapterCount()
            );
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
} 
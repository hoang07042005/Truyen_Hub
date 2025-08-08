package com.example.novel_website_schema.controller;

import com.example.novel_website_schema.service.BookmarkService;
import com.example.novel_website_schema.service.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import com.example.novel_website_schema.entity.Bookmark;
import com.example.novel_website_schema.entity.Story;
import com.example.novel_website_schema.repository.StoryRepository;
import com.example.novel_website_schema.repository.ChapterRepository;

@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkController {

    @Autowired
    private BookmarkService bookmarkService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private StoryRepository storyRepository;

    @Autowired
    private ChapterRepository chapterRepository;

    private Integer getUserIdFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            return jwtUtil.extractUserId(jwt);
        }
        return null;
    }

    @PostMapping("/{storyId}")
    public ResponseEntity<?> addBookmark(@PathVariable Integer storyId, HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        boolean added = bookmarkService.addBookmark(userId, storyId);
        return ResponseEntity.ok(added);
    }

    @DeleteMapping("/{storyId}")
    public ResponseEntity<?> removeBookmark(@PathVariable Integer storyId, HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        boolean removed = bookmarkService.removeBookmark(userId, storyId);
        return ResponseEntity.ok(removed);
    }

    @GetMapping("/{storyId}")
    public ResponseEntity<?> isBookmarked(@PathVariable Integer storyId, HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        boolean bookmarked = bookmarkService.isBookmarked(userId, storyId);
        return ResponseEntity.ok(bookmarked);
    }

    @GetMapping
    public ResponseEntity<?> getUserBookmarks(HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        List<Bookmark> bookmarks = bookmarkService.getBookmarksByUserId(userId);
        // Lấy thông tin truyện cho từng bookmark
        List<Map<String, Object>> result = bookmarks.stream().map(b -> {
            Map<String, Object> map = new HashMap<>();
            map.put("storyId", b.getStoryId());
            Story story = storyRepository.findById(b.getStoryId()).orElse(null);
            if (story != null) {
                map.put("title", story.getTitle());
                map.put("coverImage", story.getCoverImage());
                map.put("author", story.getAuthor());
                map.put("status", story.getStatus());
                // Lấy category đầu tiên làm genre
                String genre = story.getCategories() != null && !story.getCategories().isEmpty() 
                    ? story.getCategories().iterator().next().getName() 
                    : null;
                map.put("genre", genre);
                // Lấy số chương từ ChapterRepository
                long chapterCount = chapterRepository.countByStoryId(b.getStoryId());
                map.put("chapterCount", (int) chapterCount);
            }
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
} 
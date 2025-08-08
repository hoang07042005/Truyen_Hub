package com.example.novel_website_schema.controller;

import com.example.novel_website_schema.entity.History;
import com.example.novel_website_schema.service.HistoryService;
import com.example.novel_website_schema.service.JwtUtil;
import com.example.novel_website_schema.repository.StoryRepository;
import com.example.novel_website_schema.repository.ChapterRepository;
import com.example.novel_website_schema.entity.Story;
import com.example.novel_website_schema.entity.Chapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/history")
public class HistoryController {
    @Autowired
    private HistoryService historyService;
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

    @PostMapping("/read")
    public ResponseEntity<?> saveHistory(@RequestBody Map<String, Integer> payload, HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        Integer storyId = payload.get("storyId");
        Integer chapterId = payload.get("chapterId");
        historyService.saveOrUpdateHistory(userId, storyId, chapterId);
        return ResponseEntity.ok(true);
    }

    @GetMapping
    public ResponseEntity<?> getUserHistory(HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        List<History> historyList = historyService.getUserHistory(userId);
        // Lấy thêm thông tin truyện và chương cho từng bản ghi lịch sử
        List<Map<String, Object>> result = historyList.stream().map(h -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", h.getId());
            map.put("storyId", h.getStoryId());
            map.put("chapterId", h.getChapterId());
            map.put("lastReadAt", h.getLastReadAt());
            // Lấy truyện
            Story story = storyRepository.findById(h.getStoryId()).orElse(null);
            if (story != null) {
                map.put("title", story.getTitle());
                map.put("coverImage", story.getCoverImage());
                map.put("author", story.getAuthor());
            }
            // Lấy chương
            Chapter chapter = chapterRepository.findById(h.getChapterId()).orElse(null);
            if (chapter != null) {
                map.put("chapterTitle", chapter.getTitle());
                map.put("chapterNumber", chapter.getChapterNumber());
            }
            // Nếu có tiến độ, bạn có thể tính và trả về luôn
            // map.put("progress", ...);
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
} 
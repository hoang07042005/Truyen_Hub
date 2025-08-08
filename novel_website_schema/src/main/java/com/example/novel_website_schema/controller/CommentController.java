package com.example.novel_website_schema.controller;

import com.example.novel_website_schema.dto.CommentDto;
import com.example.novel_website_schema.service.CommentService;
import com.example.novel_website_schema.service.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "http://localhost:3000")
public class CommentController {
    @Autowired
    private CommentService commentService;
    @Autowired
    private JwtUtil jwtUtil;

    private Integer getUserIdFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            return jwtUtil.extractUserId(jwt);
        }
        return null;
    }

    @PostMapping
    public ResponseEntity<?> addComment(@RequestBody CommentDto dto, HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        if (dto.getContent() == null || dto.getContent().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Nội dung không được để trống");
        }
        CommentDto saved = commentService.addComment(userId, dto);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/chapter/{chapterId}")
    public ResponseEntity<List<CommentDto>> getCommentsByChapter(@PathVariable Integer chapterId) {
        return ResponseEntity.ok(commentService.getCommentsByChapter(chapterId));
    }

    @GetMapping("/story/{storyId}")
    public ResponseEntity<List<CommentDto>> getCommentsByStory(@PathVariable Integer storyId) {
        return ResponseEntity.ok(commentService.getCommentsByStory(storyId));
    }
} 
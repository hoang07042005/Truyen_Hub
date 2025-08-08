package com.example.novel_website_schema.controller;

import com.example.novel_website_schema.dto.ChapterDto;
import com.example.novel_website_schema.service.ChapterService;
import com.example.novel_website_schema.service.ViewService;
import com.example.novel_website_schema.service.CustomUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chapters")
@CrossOrigin(origins = "http://localhost:3000")
public class ChapterController {
    
    @Autowired
    private ChapterService chapterService;
    
    @Autowired
    private ViewService viewService;

    @GetMapping("/story/{storyId}")
    public ResponseEntity<List<ChapterDto>> getChaptersByStoryId(@PathVariable Integer storyId) {
        List<ChapterDto> chapters = chapterService.getChaptersByStoryId(storyId);
        return ResponseEntity.ok(chapters);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChapterDto> getChapterById(
            @PathVariable Integer id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest request) {
        ChapterDto chapter = chapterService.getChapterById(id);
        
        // Record chapter view
        Integer userId = userDetails != null ? userDetails.getUserId() : null;
        viewService.recordChapterView(id, userId, request);
        
        return ResponseEntity.ok(chapter);
    }

    // Admin endpoint for getting chapters by story ID
    @GetMapping("/admin/story/{storyId}")
    public ResponseEntity<List<ChapterDto>> getChaptersByStoryIdForAdmin(@PathVariable Integer storyId) {
        List<ChapterDto> chapters = chapterService.getChaptersByStoryId(storyId);
        return ResponseEntity.ok(chapters);
    }

    // Test endpoint to verify admin access
    @GetMapping("/admin/test")
    public ResponseEntity<String> testAdminAccess() {
        return ResponseEntity.ok("Admin access working!");
    }

    // Admin endpoint for creating a new chapter
    @PostMapping("/admin/create")
    public ResponseEntity<ChapterDto> createChapter(@RequestBody ChapterDto chapterDto) {
        try {
            System.out.println("Received chapter creation request: " + chapterDto.getTitle());
            ChapterDto createdChapter = chapterService.createChapter(chapterDto);
            System.out.println("Chapter created successfully with ID: " + createdChapter.getId());
            return ResponseEntity.ok(createdChapter);
        } catch (Exception e) {
            System.err.println("Error creating chapter: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // Admin endpoint for updating a chapter
    @PutMapping("/admin/{id}/update")
    public ResponseEntity<ChapterDto> updateChapter(@PathVariable Integer id, @RequestBody ChapterDto chapterDto) {
        try {
            ChapterDto updatedChapter = chapterService.updateChapter(id, chapterDto);
            return ResponseEntity.ok(updatedChapter);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Admin endpoint for deleting a chapter
    @DeleteMapping("/admin/{id}/delete")
    public ResponseEntity<?> deleteChapter(@PathVariable Integer id) {
        try {
            chapterService.deleteChapter(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 
package com.example.novel_website_schema.controller;

import com.example.novel_website_schema.dto.UnlockChapterRequestDto;
import com.example.novel_website_schema.entity.UnlockedChapter;
import com.example.novel_website_schema.service.ChapterUnlockService;
import com.example.novel_website_schema.service.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chapters/unlock")
@CrossOrigin(origins = "*")
public class ChapterUnlockController {
    
    @Autowired
    private ChapterUnlockService chapterUnlockService;
    
    /**
     * Mở khóa chapter bằng tiền xu
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> unlockChapter(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody UnlockChapterRequestDto request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean success = chapterUnlockService.unlockChapter(userDetails.getUserId(), request.getChapterId());
            
            if (success) {
                response.put("success", true);
                response.put("message", "Mở khóa chapter thành công");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Không đủ tiền xu hoặc chapter không tồn tại");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Có lỗi xảy ra: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Kiểm tra chapter đã được mở khóa chưa
     */
    @GetMapping("/{chapterId}")
    public ResponseEntity<Map<String, Object>> checkUnlocked(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Integer chapterId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("Checking unlock status for user: " + userDetails.getUserId() + ", chapter: " + chapterId);
            boolean isUnlocked = chapterUnlockService.isChapterUnlocked(userDetails.getUserId(), chapterId);
            System.out.println("Unlock status: " + isUnlocked);
            
            response.put("unlocked", isUnlocked);
            response.put("userId", userDetails.getUserId());
            response.put("chapterId", chapterId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error checking unlock status: " + e.getMessage());
            e.printStackTrace();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Lấy danh sách chapter đã mở khóa theo story
     */
    @GetMapping("/story/{storyId}")
    public ResponseEntity<Map<String, Object>> getUnlockedChaptersByStory(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Integer storyId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("Getting unlocked chapters for user: " + userDetails.getUserId() + ", story: " + storyId);
            List<UnlockedChapter> unlockedChapters = chapterUnlockService.getUnlockedChaptersByStory(userDetails.getUserId(), storyId);
            
            List<Map<String, Object>> chaptersData = unlockedChapters.stream()
                .map(uc -> {
                    Map<String, Object> chapterData = new HashMap<>();
                    chapterData.put("chapterId", uc.getChapter().getId());
                    chapterData.put("chapterNumber", uc.getChapter().getChapterNumber());
                    chapterData.put("title", uc.getChapter().getTitle());
                    chapterData.put("coinsSpent", uc.getCoinsSpent());
                    chapterData.put("unlockedAt", uc.getUnlockedAt());
                    return chapterData;
                })
                .collect(Collectors.toList());
            
            response.put("unlockedChapters", chaptersData);
            response.put("count", chaptersData.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error getting unlocked chapters: " + e.getMessage());
            e.printStackTrace();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
} 
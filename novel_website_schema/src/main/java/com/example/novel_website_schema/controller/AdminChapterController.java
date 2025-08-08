package com.example.novel_website_schema.controller;

import com.example.novel_website_schema.entity.Chapter;
import com.example.novel_website_schema.repository.ChapterRepository;
import com.example.novel_website_schema.service.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/chapters")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class AdminChapterController {

    @Autowired
    private ChapterRepository chapterRepository;

    /**
     * Khóa chương
     */
    @PatchMapping("/{chapterId}/lock")
    public ResponseEntity<Map<String, Object>> lockChapter(
            @PathVariable Integer chapterId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Chapter chapter = chapterRepository.findById(chapterId).orElse(null);
            if (chapter == null) {
                response.put("success", false);
                response.put("message", "Không tìm thấy chương");
                return ResponseEntity.badRequest().body(response);
            }

            chapter.setIsLocked(true);
            chapterRepository.save(chapter);

            response.put("success", true);
            response.put("message", "Đã khóa chương thành công");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Có lỗi xảy ra khi khóa chương");
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Mở khóa chương
     */
    @PatchMapping("/{chapterId}/unlock")
    public ResponseEntity<Map<String, Object>> unlockChapter(
            @PathVariable Integer chapterId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Chapter chapter = chapterRepository.findById(chapterId).orElse(null);
            if (chapter == null) {
                response.put("success", false);
                response.put("message", "Không tìm thấy chương");
                return ResponseEntity.badRequest().body(response);
            }

            chapter.setIsLocked(false);
            chapterRepository.save(chapter);

            response.put("success", true);
            response.put("message", "Đã mở khóa chương thành công");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Có lỗi xảy ra khi mở khóa chương");
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Đặt giá chương
     */
    @PatchMapping("/{chapterId}/price")
    public ResponseEntity<Map<String, Object>> setChapterPrice(
            @PathVariable Integer chapterId,
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Chapter chapter = chapterRepository.findById(chapterId).orElse(null);
            if (chapter == null) {
                response.put("success", false);
                response.put("message", "Không tìm thấy chương");
                return ResponseEntity.badRequest().body(response);
            }

            Integer coinsRequired = (Integer) request.get("coinsRequired");
            if (coinsRequired == null || coinsRequired < 0) {
                response.put("success", false);
                response.put("message", "Số xu không hợp lệ");
                return ResponseEntity.badRequest().body(response);
            }

            chapter.setCoinsRequired(coinsRequired);
            chapterRepository.save(chapter);

            response.put("success", true);
            response.put("message", "Đã cập nhật giá chương thành công");
            response.put("coinsRequired", coinsRequired);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Có lỗi xảy ra khi cập nhật giá chương");
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Lấy thông tin chương
     */
    @GetMapping("/{chapterId}")
    public ResponseEntity<Map<String, Object>> getChapterInfo(
            @PathVariable Integer chapterId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Chapter chapter = chapterRepository.findById(chapterId).orElse(null);
            if (chapter == null) {
                response.put("success", false);
                response.put("message", "Không tìm thấy chương");
                return ResponseEntity.badRequest().body(response);
            }

            Map<String, Object> chapterInfo = new HashMap<>();
            chapterInfo.put("id", chapter.getId());
            chapterInfo.put("title", chapter.getTitle());
            chapterInfo.put("chapterNumber", chapter.getChapterNumber());
            chapterInfo.put("isLocked", chapter.getIsLocked());
            chapterInfo.put("coinsRequired", chapter.getCoinsRequired());

            response.put("success", true);
            response.put("chapter", chapterInfo);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Có lỗi xảy ra khi lấy thông tin chương");
            return ResponseEntity.badRequest().body(response);
        }
    }
} 
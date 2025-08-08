package com.example.novel_website_schema.controller;

import com.example.novel_website_schema.entity.Like;
import com.example.novel_website_schema.service.LikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.example.novel_website_schema.service.CustomUserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/likes")
@CrossOrigin(origins = "http://localhost:3000")
public class LikeController {
    
    @Autowired
    private LikeService likeService;

    @PostMapping("/story/{storyId}")
    public ResponseEntity<?> likeStory(
            @PathVariable Integer storyId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            Integer userId = userDetails.getUserId();
            Like like = likeService.likeStory(userId, storyId);
            return ResponseEntity.ok(like);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/story/{storyId}")
    public ResponseEntity<?> unlikeStory(
            @PathVariable Integer storyId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            Integer userId = userDetails.getUserId();
            likeService.unlikeStory(userId, storyId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/story/{storyId}/user")
    public ResponseEntity<?> isLikedByUser(
            @PathVariable Integer storyId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.badRequest().body("User not authenticated");
            }
            Integer userId = userDetails.getUserId();
            System.out.println("Checking like for user: " + userId + ", story: " + storyId);
            boolean isLiked = likeService.isLikedByUser(userId, storyId);
            return ResponseEntity.ok(isLiked);
        } catch (Exception e) {
            System.err.println("Error in isLikedByUser: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/story/{storyId}")
    public ResponseEntity<?> getStoryLikes(@PathVariable Integer storyId) {
        try {
            List<Like> likes = likeService.getStoryLikes(storyId);
            return ResponseEntity.ok(likes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 
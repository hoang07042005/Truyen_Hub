package com.example.novel_website_schema.controller;

import com.example.novel_website_schema.dto.RatingRequest;
import com.example.novel_website_schema.dto.RatingDto;
import com.example.novel_website_schema.entity.Rating;
import com.example.novel_website_schema.service.RatingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.example.novel_website_schema.service.CustomUserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/ratings")
@CrossOrigin(origins = "http://localhost:3000")
public class RatingController {
    
    @Autowired
    private RatingService ratingService;

    @PostMapping("/story/{storyId}")
    public ResponseEntity<?> rateStory(
            @PathVariable Integer storyId,
            @RequestBody RatingRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            // Extract userId from CustomUserDetails
            Integer userId = userDetails.getUserId();
            
            RatingDto rating = ratingService.createOrUpdateRating(userId, storyId, request);
            return ResponseEntity.ok(rating);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/story/{storyId}/user")
    public ResponseEntity<?> getUserRating(
            @PathVariable Integer storyId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.badRequest().body("User not authenticated");
            }
            Integer userId = userDetails.getUserId();
            System.out.println("Getting rating for user: " + userId + ", story: " + storyId);
            Optional<RatingDto> rating = ratingService.getUserRating(userId, storyId);
            
            if (rating.isPresent()) {
                return ResponseEntity.ok(rating.get());
            } else {
                return ResponseEntity.ok(null);
            }
        } catch (Exception e) {
            System.err.println("Error in getUserRating: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/story/{storyId}")
    public ResponseEntity<?> getStoryRatings(@PathVariable Integer storyId) {
        try {
            System.out.println("Getting ratings for story: " + storyId);
            List<RatingDto> ratings = ratingService.getStoryRatings(storyId);
            System.out.println("Found " + ratings.size() + " ratings");
            for (RatingDto rating : ratings) {
                System.out.println("Rating: " + rating.getId() + ", User: " + 
                    (rating.getUser() != null ? rating.getUser().getUsername() : "null") + 
                    ", Rating: " + rating.getRating());
            }
            return ResponseEntity.ok(ratings);
        } catch (Exception e) {
            System.err.println("Error in getStoryRatings: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/story/{storyId}")
    public ResponseEntity<?> deleteRating(
            @PathVariable Integer storyId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            Integer userId = userDetails.getUserId();
            ratingService.deleteRating(userId, storyId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 
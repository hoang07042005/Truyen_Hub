package com.example.novel_website_schema.service;

import com.example.novel_website_schema.dto.RatingRequest;
import com.example.novel_website_schema.dto.RatingDto;
import com.example.novel_website_schema.dto.UserDto;
import com.example.novel_website_schema.entity.Rating;
import com.example.novel_website_schema.entity.Story;
import com.example.novel_website_schema.entity.User;
import com.example.novel_website_schema.repository.RatingRepository;
import com.example.novel_website_schema.repository.StoryRepository;
import com.example.novel_website_schema.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class RatingService {

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StoryRepository storyRepository;

    public RatingDto createOrUpdateRating(Integer userId, Integer storyId, RatingRequest request) {
        // Validate rating value
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new RuntimeException("Rating phải từ 1 đến 5");
        }

        // Check if user and story exist
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User không tồn tại");
        }

        Optional<Story> storyOpt = storyRepository.findById(storyId);
        if (storyOpt.isEmpty()) {
            throw new RuntimeException("Story không tồn tại");
        }

        // Check if rating already exists
        Optional<Rating> existingRating = ratingRepository.findByUserIdAndStoryId(userId, storyId);

        if (existingRating.isPresent()) {
            // Update existing rating
            Rating rating = existingRating.get();
            rating.setRating(request.getRating());
            rating.setComment(request.getComment());
            Rating savedRating = ratingRepository.save(rating);
            return convertToDto(savedRating);
        } else {
            // Create new rating
            Rating rating = new Rating(userId, storyId, request.getRating(), request.getComment());
            Rating savedRating = ratingRepository.save(rating);
            return convertToDto(savedRating);
        }
    }

    public Optional<RatingDto> getUserRating(Integer userId, Integer storyId) {
        Optional<Rating> rating = ratingRepository.findByUserIdAndStoryId(userId, storyId);
        return rating.map(this::convertToDto);
    }

    public List<RatingDto> getStoryRatings(Integer storyId) {
        List<Rating> ratings = ratingRepository.findByStoryIdWithUser(storyId);
        return ratings.stream().map(this::convertToDto).toList();
    }

    private RatingDto convertToDto(Rating rating) {
        UserDto userDto = null;
        try {
            if (rating.getUser() != null) {
                User user = rating.getUser();
                userDto = new UserDto(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getAvatar(),
                        user.getRole() != null ? user.getRole().name() : null,
                        user.getPoints(),
                        user.getBadge(),
                        user.getCreatedAt(),
                        user.getUpdatedAt(),
                        0); // Removed getStoriesReadCount() since it doesn't exist
            }
        } catch (Exception e) {
            // User might be a proxy, try to load it manually
            try {
                Optional<User> userOpt = userRepository.findById(rating.getUserId());
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    userDto = new UserDto(
                            user.getId(),
                            user.getUsername(),
                            user.getEmail(),
                            user.getAvatar(),
                            user.getRole() != null ? user.getRole().name() : null,
                            user.getPoints(),
                            user.getBadge(),
                            user.getCreatedAt(),
                            user.getUpdatedAt(),
                            0); // Removed getStoriesReadCount() since it doesn't exist

                }
            } catch (Exception ex) {
                System.err.println("Error loading user for rating: " + ex.getMessage());
            }
        }

        return new RatingDto(
                rating.getId(),
                rating.getUserId(),
                rating.getStoryId(),
                rating.getRating(),
                rating.getComment(),
                rating.getCreatedAt(),
                rating.getUpdatedAt(),
                userDto);
    }

    public long getRatingCount(Integer storyId) {
        return ratingRepository.countByStoryId(storyId);
    }

    public Double getAverageRating(Integer storyId) {
        Double avg = ratingRepository.getAverageRatingByStoryId(storyId);
        return avg != null ? avg : 0.0;
    }

    public void deleteRating(Integer userId, Integer storyId) {
        ratingRepository.deleteByUserIdAndStoryId(userId, storyId);
    }
}
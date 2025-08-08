package com.example.novel_website_schema.service;

import com.example.novel_website_schema.dto.StoryStatsDto;
import com.example.novel_website_schema.repository.LikeRepository;
import com.example.novel_website_schema.repository.RatingRepository;
import com.example.novel_website_schema.repository.StoryViewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class StatsService {

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private StoryViewRepository storyViewRepository;

    public StoryStatsDto getStoryStats(Integer storyId) {
        Long likeCount = likeRepository.countByStoryId(storyId);
        Long ratingCount = ratingRepository.countByStoryId(storyId);
        Double averageRating = ratingRepository.getAverageRatingByStoryId(storyId);
        Long viewCount = storyViewRepository.countUniqueViewsByStoryId(storyId);

        // Handle null average rating
        if (averageRating == null) {
            averageRating = 0.0;
        }

        // Handle null view count
        if (viewCount == null) {
            viewCount = 0L;
        }

        return new StoryStatsDto(storyId, likeCount, ratingCount, averageRating, viewCount);
    }

    public long getDailyReads() {
        // For now, return total views count
        // TODO: Implement logic to count views from today only
        return storyViewRepository.count();
    }
}
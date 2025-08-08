package com.example.novel_website_schema.service;

import com.example.novel_website_schema.entity.Like;
import com.example.novel_website_schema.entity.Story;
import com.example.novel_website_schema.entity.User;
import com.example.novel_website_schema.repository.LikeRepository;
import com.example.novel_website_schema.repository.StoryRepository;
import com.example.novel_website_schema.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LikeService {
    
    @Autowired
    private LikeRepository likeRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private StoryRepository storyRepository;

    public Like likeStory(Integer userId, Integer storyId) {
        // Check if user and story exist
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User không tồn tại");
        }

        Optional<Story> storyOpt = storyRepository.findById(storyId);
        if (storyOpt.isEmpty()) {
            throw new RuntimeException("Story không tồn tại");
        }

        // Check if already liked
        if (likeRepository.existsByUserIdAndStoryId(userId, storyId)) {
            throw new RuntimeException("Bạn đã thích truyện này rồi");
        }

        // Create new like
        Like like = new Like(userId, storyId);
        return likeRepository.save(like);
    }

    public void unlikeStory(Integer userId, Integer storyId) {
        // Check if like exists
        if (!likeRepository.existsByUserIdAndStoryId(userId, storyId)) {
            throw new RuntimeException("Bạn chưa thích truyện này");
        }

        likeRepository.deleteByUserIdAndStoryId(userId, storyId);
    }

    public boolean isLikedByUser(Integer userId, Integer storyId) {
        return likeRepository.existsByUserIdAndStoryId(userId, storyId);
    }

    public List<Like> getStoryLikes(Integer storyId) {
        return likeRepository.findByStoryId(storyId);
    }

    public long getLikeCount(Integer storyId) {
        return likeRepository.countByStoryId(storyId);
    }
} 
package com.example.novel_website_schema.service;

import com.example.novel_website_schema.entity.Bookmark;
import com.example.novel_website_schema.entity.Story;
import com.example.novel_website_schema.entity.User;
import com.example.novel_website_schema.repository.BookmarkRepository;
import com.example.novel_website_schema.repository.StoryRepository;
import com.example.novel_website_schema.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BookmarkService {

    @Autowired
    private BookmarkRepository bookmarkRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StoryRepository storyRepository;

    public boolean addBookmark(Integer userId, Integer storyId) {
        if (userId == null || storyId == null) return false;
        if (!bookmarkRepository.existsByUserIdAndStoryId(userId, storyId)) {
            Bookmark bookmark = new Bookmark();
            bookmark.setUserId(userId);
            bookmark.setStoryId(storyId);
            bookmark.setCreatedAt(java.time.LocalDateTime.now());
            bookmarkRepository.save(bookmark);
            return true;
        }
        return false;
    }

    public boolean removeBookmark(Integer userId, Integer storyId) {
        if (userId == null || storyId == null) return false;
        if (bookmarkRepository.existsByUserIdAndStoryId(userId, storyId)) {
            bookmarkRepository.deleteByUserIdAndStoryId(userId, storyId);
            return true;
        }
        return false;
    }

    public boolean isBookmarked(Integer userId, Integer storyId) {
        if (userId == null || storyId == null) return false;
        return bookmarkRepository.existsByUserIdAndStoryId(userId, storyId);
    }

    public List<Bookmark> getBookmarksByUserId(Integer userId) {
        return bookmarkRepository.findByUserId(userId);
    }
}
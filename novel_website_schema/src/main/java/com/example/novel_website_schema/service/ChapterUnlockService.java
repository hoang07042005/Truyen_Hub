package com.example.novel_website_schema.service;

import com.example.novel_website_schema.entity.Chapter;
import com.example.novel_website_schema.entity.UnlockedChapter;
import com.example.novel_website_schema.entity.User;
import com.example.novel_website_schema.repository.ChapterRepository;
import com.example.novel_website_schema.repository.UnlockedChapterRepository;
import com.example.novel_website_schema.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class ChapterUnlockService {
    
    @Autowired
    private UnlockedChapterRepository unlockedChapterRepository;
    
    @Autowired
    private ChapterRepository chapterRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CoinService coinService;
    
    /**
     * Kiểm tra chapter đã được mở khóa chưa
     */
    public boolean isChapterUnlocked(Integer userId, Integer chapterId) {
        System.out.println("Checking if chapter " + chapterId + " is unlocked for user " + userId);
        boolean exists = unlockedChapterRepository.existsByUserIdAndChapterId(userId, chapterId);
        System.out.println("Result: " + exists);
        return exists;
    }
    
    /**
     * Mở khóa chapter bằng tiền xu
     */
    @Transactional
    public boolean unlockChapter(Integer userId, Integer chapterId) {
        // Kiểm tra chapter có tồn tại không
        Optional<Chapter> chapterOpt = chapterRepository.findById(chapterId);
        if (chapterOpt.isEmpty()) {
            throw new RuntimeException("Chapter not found");
        }
        
        Chapter chapter = chapterOpt.get();
        
        // Kiểm tra chapter có bị khóa không
        if (!chapter.getIsLocked()) {
            return true; // Chapter đã free
        }
        
        // Kiểm tra đã mở khóa chưa
        if (isChapterUnlocked(userId, chapterId)) {
            return true; // Đã mở khóa rồi
        }
        
        // Kiểm tra có đủ tiền xu không
        Integer coinsRequired = chapter.getCoinsRequired();
        if (!coinService.hasEnoughCoins(userId, coinsRequired)) {
            return false; // Không đủ tiền xu
        }
        
        // Trừ tiền xu
        boolean spent = coinService.spendCoins(userId, coinsRequired, 
            "Mở khóa chapter: " + chapter.getTitle(), 
            "chapter_" + chapterId);
        
        if (!spent) {
            return false;
        }
        
        // Tạo record unlocked chapter
        UnlockedChapter unlockedChapter = new UnlockedChapter();
        unlockedChapter.setUser(userRepository.findById(userId).orElseThrow());
        unlockedChapter.setChapter(chapter);
        unlockedChapter.setCoinsSpent(coinsRequired);
        
        unlockedChapterRepository.save(unlockedChapter);
        
        return true;
    }
    
    /**
     * Lấy danh sách chapter đã mở khóa của user
     */
    public java.util.List<UnlockedChapter> getUnlockedChapters(Integer userId) {
        return unlockedChapterRepository.findByUserIdOrderByUnlockedAtDesc(userId);
    }
    
    /**
     * Lấy danh sách chapter đã mở khóa của user theo story
     */
    public java.util.List<UnlockedChapter> getUnlockedChaptersByStory(Integer userId, Integer storyId) {
        return unlockedChapterRepository.findByUserIdAndChapterStoryId(userId, storyId);
    }
} 
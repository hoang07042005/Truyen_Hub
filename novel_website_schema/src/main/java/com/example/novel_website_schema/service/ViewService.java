package com.example.novel_website_schema.service;

import com.example.novel_website_schema.entity.StoryView;
import com.example.novel_website_schema.entity.ChapterView;
import com.example.novel_website_schema.repository.StoryViewRepository;
import com.example.novel_website_schema.repository.ChapterViewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;

@Service
public class ViewService {
    
    @Autowired
    private StoryViewRepository storyViewRepository;
    
    @Autowired
    private ChapterViewRepository chapterViewRepository;

    public void recordStoryView(Integer storyId, Integer userId, HttpServletRequest request) {
        try {
            String ipAddress = getClientIpAddress(request);
            String userAgent = request.getHeader("User-Agent");
            
            StoryView storyView = new StoryView();
            storyView.setStoryId(storyId);
            storyView.setUserId(userId); // null if not logged in
            storyView.setIpAddress(ipAddress);
            storyView.setUserAgent(userAgent);
            storyView.setViewedAt(LocalDateTime.now());
            
            storyViewRepository.save(storyView);
            System.out.println("Recorded story view: storyId=" + storyId + ", userId=" + userId + ", ip=" + ipAddress);
        } catch (Exception e) {
            System.err.println("Error recording story view: " + e.getMessage());
            // Don't throw exception to avoid breaking the main flow
        }
    }

    public void recordChapterView(Integer chapterId, Integer userId, HttpServletRequest request) {
        try {
            String ipAddress = getClientIpAddress(request);
            String userAgent = request.getHeader("User-Agent");
            
            ChapterView chapterView = new ChapterView();
            chapterView.setChapterId(chapterId);
            chapterView.setUserId(userId); // null if not logged in
            chapterView.setIpAddress(ipAddress);
            chapterView.setUserAgent(userAgent);
            chapterView.setViewedAt(LocalDateTime.now());
            
            chapterViewRepository.save(chapterView);
            System.out.println("Recorded chapter view: chapterId=" + chapterId + ", userId=" + userId + ", ip=" + ipAddress);
        } catch (Exception e) {
            System.err.println("Error recording chapter view: " + e.getMessage());
            // Don't throw exception to avoid breaking the main flow
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0];
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
} 
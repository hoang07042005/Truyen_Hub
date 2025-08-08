package com.example.novel_website_schema.service;

import com.example.novel_website_schema.entity.History;
import com.example.novel_website_schema.repository.HistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class HistoryService {
    @Autowired
    private HistoryRepository historyRepository;

    public void saveOrUpdateHistory(Integer userId, Integer storyId, Integer chapterId) {
        Optional<History> historyOpt = historyRepository.findByUserIdAndStoryIdAndChapterId(userId, storyId, chapterId);
        if (historyOpt.isPresent()) {
            History history = historyOpt.get();
            history.setLastReadAt(LocalDateTime.now());
            historyRepository.save(history);
        } else {
            History history = new History();
            history.setUserId(userId);
            history.setStoryId(storyId);
            history.setChapterId(chapterId);
            history.setLastReadAt(LocalDateTime.now());
            historyRepository.save(history);
        }
    }

    public List<History> getUserHistory(Integer userId) {
        return historyRepository.findByUserIdOrderByLastReadAtDesc(userId);
    }
}
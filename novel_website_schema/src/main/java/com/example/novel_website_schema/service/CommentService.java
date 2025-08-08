package com.example.novel_website_schema.service;

import com.example.novel_website_schema.dto.CommentDto;
import com.example.novel_website_schema.entity.Comment;
import com.example.novel_website_schema.repository.CommentRepository;
import com.example.novel_website_schema.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {
    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private UserRepository userRepository;

    public CommentDto addComment(Integer userId, CommentDto dto) {
        Comment comment = new Comment();
        comment.setUserId(userId);
        comment.setStoryId(dto.getStoryId());
        comment.setChapterId(dto.getChapterId());
        comment.setContent(dto.getContent());
        comment.setCreatedAt(LocalDateTime.now());
        comment = commentRepository.save(comment);
        String username = userRepository.findById(comment.getUserId()).map(u -> u.getUsername())
                .orElse("User #" + comment.getUserId());
        String avatar = userRepository.findById(comment.getUserId()).map(u -> u.getAvatar()).orElse(null);
        return new CommentDto(
                comment.getId(), comment.getUserId(), comment.getStoryId(),
                comment.getChapterId(), comment.getContent(), comment.getCreatedAt(), username, avatar);
    }

    public List<CommentDto> getCommentsByChapter(Integer chapterId) {
        return commentRepository.findByChapterIdOrderByCreatedAtDesc(chapterId)
                .stream()
                .map(c -> new CommentDto(
                        c.getId(), c.getUserId(), c.getStoryId(), c.getChapterId(), c.getContent(), c.getCreatedAt(),
                        userRepository.findById(c.getUserId()).map(u -> u.getUsername())
                                .orElse("User #" + c.getUserId()),
                        userRepository.findById(c.getUserId()).map(u -> u.getAvatar()).orElse(null)))
                .collect(Collectors.toList());
    }

    public List<CommentDto> getCommentsByStory(Integer storyId) {
        return commentRepository.findByStoryIdOrderByCreatedAtDesc(storyId)
                .stream()
                .map(c -> new CommentDto(
                        c.getId(), c.getUserId(), c.getStoryId(), c.getChapterId(), c.getContent(), c.getCreatedAt(),
                        userRepository.findById(c.getUserId()).map(u -> u.getUsername())
                                .orElse("User #" + c.getUserId()),
                        userRepository.findById(c.getUserId()).map(u -> u.getAvatar()).orElse(null)))
                .collect(Collectors.toList());
    }
}
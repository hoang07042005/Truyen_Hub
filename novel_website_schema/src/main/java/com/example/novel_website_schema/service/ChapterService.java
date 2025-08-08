package com.example.novel_website_schema.service;

import com.example.novel_website_schema.dto.ChapterDto;
import com.example.novel_website_schema.entity.Chapter;
import com.example.novel_website_schema.repository.ChapterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChapterService {

    @Autowired
    private ChapterRepository chapterRepository;

    public List<ChapterDto> getChaptersByStoryId(Integer storyId) {
        List<Chapter> chapters = chapterRepository.findByStoryIdOrderByChapterNumberAsc(storyId);
        return chapters.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public ChapterDto getChapterById(Integer id) {
        Chapter chapter = chapterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chương không tồn tại"));
        return convertToDTO(chapter);
    }

    public ChapterDto createChapter(ChapterDto chapterDto) {
        Chapter chapter = new Chapter();
        chapter.setStoryId(chapterDto.getStoryId());
        chapter.setTitle(chapterDto.getTitle());
        chapter.setSlug(generateSlug(chapterDto.getTitle()));
        chapter.setContent(chapterDto.getContent());
        chapter.setChapterNumber(chapterDto.getChapterNumber());
        chapter.setViews(0);
        chapter.setCreatedAt(java.time.LocalDateTime.now());
        chapter.setUpdatedAt(java.time.LocalDateTime.now());
        
        Chapter savedChapter = chapterRepository.save(chapter);
        return convertToDTO(savedChapter);
    }

    public ChapterDto updateChapter(Integer id, ChapterDto chapterDto) {
        Chapter chapter = chapterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chương không tồn tại"));
        
        chapter.setTitle(chapterDto.getTitle());
        chapter.setSlug(generateSlug(chapterDto.getTitle()));
        chapter.setContent(chapterDto.getContent());
        chapter.setChapterNumber(chapterDto.getChapterNumber());
        chapter.setUpdatedAt(java.time.LocalDateTime.now());
        
        Chapter updatedChapter = chapterRepository.save(chapter);
        return convertToDTO(updatedChapter);
    }

    public void deleteChapter(Integer id) {
        if (!chapterRepository.existsById(id)) {
            throw new RuntimeException("Chương không tồn tại");
        }
        chapterRepository.deleteById(id);
    }

    private String generateSlug(String title) {
        return title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
    }

    private ChapterDto convertToDTO(Chapter chapter) {
        ChapterDto dto = new ChapterDto();
        dto.setId(chapter.getId());
        dto.setStoryId(chapter.getStoryId());
        dto.setTitle(chapter.getTitle());
        dto.setSlug(chapter.getSlug());
        dto.setContent(chapter.getContent());
        dto.setViews(chapter.getViews());
        dto.setCreatedAt(chapter.getCreatedAt());
        dto.setUpdatedAt(chapter.getUpdatedAt());
        dto.setChapterNumber(chapter.getChapterNumber());
        dto.setIsLocked(chapter.getIsLocked());
        dto.setCoinsRequired(chapter.getCoinsRequired());
        return dto;
    }
}
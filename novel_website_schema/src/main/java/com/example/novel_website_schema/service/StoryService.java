package com.example.novel_website_schema.service;

import com.example.novel_website_schema.dto.StoryDto;
import com.example.novel_website_schema.entity.Story;
import com.example.novel_website_schema.entity.Chapter;
import com.example.novel_website_schema.repository.StoryRepository;
import com.example.novel_website_schema.repository.ChapterRepository;
import com.example.novel_website_schema.repository.RatingRepository;
import com.example.novel_website_schema.repository.LikeRepository;
import com.example.novel_website_schema.repository.StoryViewRepository;
import com.example.novel_website_schema.service.ActivityService;
import com.example.novel_website_schema.entity.Activity;
import com.example.novel_website_schema.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;
import java.util.ArrayList;
import java.util.UUID;
import java.util.HashSet;
import com.example.novel_website_schema.entity.Category;

@Service
public class StoryService {

    @Autowired
    private StoryRepository storyRepository;

    @Autowired
    private ChapterRepository chapterRepository;

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private StoryViewRepository storyViewRepository;

    @Autowired
    private ActivityService activityService;

    @Autowired
    private CategoryRepository categoryRepository;

    public Page<StoryDto> getAllStories(Pageable pageable) {
        Page<Story> stories = storyRepository.findAll(pageable);
        return stories.map(this::convertToDTO);
    }

    public StoryDto getStoryById(Integer id) {
        Story story = storyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Truyện không tồn tại"));
        // Log story view activity - only log if we have a valid story
        try {
            activityService.logActivity(
                Activity.ActivityType.VIEW_STORY,
                "Truyện \"" + story.getTitle() + "\" được xem",
                null, // userId is null for anonymous views
                story.getId()
            );
        } catch (Exception e) {
            // Log error but don't fail the main request
            System.err.println("Error logging story view activity: " + e.getMessage());
        }
        return convertToDTO(story);
    }

    public Page<StoryDto> searchStories(String keyword, Pageable pageable) {
        Page<Story> stories = storyRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(
                keyword, keyword, pageable);
        return stories.map(this::convertToDTO);
    }

    public Page<StoryDto> getStoriesByCategory(Integer categoryId, Pageable pageable) {
        Page<Story> stories = storyRepository.findByCategoryId(categoryId, pageable);
        return stories.map(this::convertToDTO);
    }

    public Page<StoryDto> getStoriesByCategoryName(String categoryName, Pageable pageable) {
        Page<Story> stories = storyRepository.findByCategoryName(categoryName, pageable);
        return stories.map(this::convertToDTO);
    }

    public List<StoryDto> getLatestStories(int limit) {
        List<Story> stories = storyRepository.findTopByOrderByCreatedAtDesc(limit);
        return stories.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<StoryDto> getPopularStories(int limit) {
        List<Story> stories = storyRepository.findTopByOrderByViewsDesc(limit);
        return stories.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    public List<StoryDto> getTopRatedStories(int limit) {
        List<Story> stories = storyRepository.findTopByOrderByRatingDesc(limit);
        return stories.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    public List<StoryDto> getMostLikedStories(int limit) {
        List<Story> stories = storyRepository.findTopByOrderByLikeCountDesc(limit);
        return stories.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public long getTotalStoriesCount() {
        return storyRepository.count();
    }

    public List<StoryDto> getTopStoriesByViews(int limit) {
        List<Story> stories = storyRepository.findTopByOrderByViewsDesc(limit);
        return stories.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Admin CRUD operations
    public StoryDto createStory(StoryDto storyDto) {
        Story story = new Story();
        story.setTitle(storyDto.getTitle());
        story.setSlug(generateSlug(storyDto.getTitle()));
        story.setAuthor(storyDto.getAuthor());
        story.setDescription(storyDto.getDescription());
        story.setCoverImage(storyDto.getCoverImage());
        story.setStatus(Story.Status.valueOf(storyDto.getStatus()));
        story.setViews(0);
        
        story = storyRepository.save(story);
        
        // Handle categories if provided
        if (storyDto.getCategories() != null && !storyDto.getCategories().isEmpty()) {
            assignCategoriesToStory(story, storyDto.getCategories());
        }
        
        return convertToDTO(story);
    }

    public StoryDto createStory(StoryDto storyDto, MultipartFile coverImage) {
        Story story = new Story();
        story.setTitle(storyDto.getTitle());
        story.setSlug(generateSlug(storyDto.getTitle()));
        story.setAuthor(storyDto.getAuthor());
        story.setDescription(storyDto.getDescription());
        story.setStatus(Story.Status.valueOf(storyDto.getStatus()));
        story.setViews(0);
        
        // Handle file upload if provided
        if (coverImage != null && !coverImage.isEmpty()) {
            try {
                String fileName = saveFile(coverImage);
                story.setCoverImage(fileName);
            } catch (IOException e) {
                throw new RuntimeException("Lỗi khi lưu file ảnh: " + e.getMessage());
            }
        } else {
            story.setCoverImage(storyDto.getCoverImage());
        }
        
        story = storyRepository.save(story);
        
        // Handle categories if provided
        if (storyDto.getCategories() != null && !storyDto.getCategories().isEmpty()) {
            assignCategoriesToStory(story, storyDto.getCategories());
        }
        
        return convertToDTO(story);
    }

    private void assignCategoriesToStory(Story story, List<String> categoryNames) {
        try {
            if (categoryNames != null && !categoryNames.isEmpty()) {
                List<Category> categories = categoryRepository.findByNameIn(categoryNames);
                if (!categories.isEmpty()) {
                    story.setCategories(new HashSet<>(categories));
                    storyRepository.save(story);
                } else {
                    System.err.println("No categories found for names: " + categoryNames);
                }
            }
        } catch (Exception e) {
            System.err.println("Error assigning categories to story: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String saveFile(MultipartFile file) throws IOException {
        // Create uploads directory if it doesn't exist
        String uploadDir = "uploads/story-covers/";
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String fileName = UUID.randomUUID().toString() + fileExtension;
        
        // Save file
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);
        
        // Return the full URL path for the file
        return "http://localhost:8080/uploads/story-covers/" + fileName;
    }

    public StoryDto updateStory(Integer id, StoryDto storyDto) {
        Story story = storyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Truyện không tồn tại"));
        
        story.setTitle(storyDto.getTitle());
        story.setAuthor(storyDto.getAuthor());
        story.setDescription(storyDto.getDescription());
        story.setCoverImage(storyDto.getCoverImage());
        story.setStatus(Story.Status.valueOf(storyDto.getStatus()));
        
        story = storyRepository.save(story);
        
        // Handle categories if provided
        if (storyDto.getCategories() != null && !storyDto.getCategories().isEmpty()) {
            assignCategoriesToStory(story, storyDto.getCategories());
        }
        
        return convertToDTO(story);
    }

    public StoryDto updateStory(Integer id, StoryDto storyDto, MultipartFile coverImage) {
        Story story = storyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Truyện không tồn tại"));
        
        story.setTitle(storyDto.getTitle());
        story.setAuthor(storyDto.getAuthor());
        story.setDescription(storyDto.getDescription());
        story.setStatus(Story.Status.valueOf(storyDto.getStatus()));
        
        // Handle file upload if provided
        if (coverImage != null && !coverImage.isEmpty()) {
            try {
                String fileName = saveFile(coverImage);
                story.setCoverImage(fileName);
            } catch (IOException e) {
                throw new RuntimeException("Lỗi khi lưu file ảnh: " + e.getMessage());
            }
        } else {
            story.setCoverImage(storyDto.getCoverImage());
        }
        
        story = storyRepository.save(story);
        
        // Handle categories if provided
        if (storyDto.getCategories() != null && !storyDto.getCategories().isEmpty()) {
            assignCategoriesToStory(story, storyDto.getCategories());
        }
        
        return convertToDTO(story);
    }

    public void deleteStory(Integer storyId) {
        Story story = storyRepository.findById(storyId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy truyện với ID: " + storyId));
        
        // Delete related chapters first
        List<Chapter> chapters = chapterRepository.findByStoryId(storyId);
        chapterRepository.deleteAll(chapters);
        
        // Delete story
        storyRepository.delete(story);
    }

    public void updateStoryStatus(Integer id, String status) {
        Story story = storyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Truyện không tồn tại"));
        
        story.setStatus(Story.Status.valueOf(status));
        storyRepository.save(story);
    }

    private String generateSlug(String title) {
        return title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
    }

    private StoryDto convertToDTO(Story story) {
        StoryDto dto = new StoryDto();
        dto.setId(story.getId());
        dto.setTitle(story.getTitle());
        dto.setSlug(story.getSlug());
        dto.setAuthor(story.getAuthor());
        dto.setDescription(story.getDescription());
        dto.setCoverImage(story.getCoverImage());
        dto.setStatus(story.getStatus().name());
        dto.setViews(story.getViews());
        dto.setCreatedAt(story.getCreatedAt());
        dto.setUpdatedAt(story.getUpdatedAt());

        // Get rating statistics
        Long ratingCount = ratingRepository.countByStoryId(story.getId());
        Double averageRating = ratingRepository.getAverageRatingByStoryId(story.getId());
        dto.setRatingCount(ratingCount != null ? ratingCount.intValue() : 0);
        dto.setAverageRating(averageRating != null ? averageRating : 0.0);

        // Get like count
        Long likeCount = likeRepository.countByStoryId(story.getId());
        dto.setLikeCount(likeCount != null ? likeCount.intValue() : 0);

        // Get view count from story_views table
        Long viewCount = storyViewRepository.countUniqueViewsByStoryId(story.getId());
        dto.setViewCount(viewCount != null ? viewCount.intValue() : 0);

        // Get categories from relationship - avoid LazyInitializationException
        try {
            List<String> categories = story.getCategories().stream()
                    .map(category -> category.getName())
                    .collect(Collectors.toList());
            dto.setCategories(categories);
        } catch (Exception e) {
            // If lazy loading fails, set empty list
            dto.setCategories(new ArrayList<>());
        }

        // Get chapter count
        Integer chapterCount = chapterRepository.countByStoryId(story.getId());
        dto.setChapterCount(chapterCount);

        // Get last chapter info
        Optional<Chapter> lastChapterOpt = chapterRepository.findFirstByStoryIdOrderByChapterNumberDesc(story.getId());
        if (lastChapterOpt.isPresent()) {
            Chapter lastChapter = lastChapterOpt.get();
            dto.setLastChapterTitle(lastChapter.getTitle());
            dto.setLastChapterDate(lastChapter.getCreatedAt());
        }

        return dto;
    }
}
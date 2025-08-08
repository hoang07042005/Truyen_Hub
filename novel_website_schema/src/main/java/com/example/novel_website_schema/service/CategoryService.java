package com.example.novel_website_schema.service;

import com.example.novel_website_schema.dto.CategoryDto;
import com.example.novel_website_schema.entity.Category;
import com.example.novel_website_schema.repository.CategoryRepository;
import com.example.novel_website_schema.repository.StoryCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private StoryCategoryRepository storyCategoryRepository;

    public List<CategoryDto> getAllCategoriesWithStats() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream().map(this::convertToDtoWithStats).collect(Collectors.toList());
    }

    public CategoryDto getCategoryById(Integer id) {
        Category category = categoryRepository.findById(id).orElse(null);
        return category != null ? convertToDtoWithStats(category) : null;
    }

    public CategoryDto createCategory(CategoryDto categoryDto) {
        Category category = new Category();
        category.setName(categoryDto.getName());
        category.setDescription(categoryDto.getDescription());
        category.setColor(categoryDto.getColor());
        category.setSlug(categoryDto.getName().toLowerCase().replace(" ", "-"));
        
        Category savedCategory = categoryRepository.save(category);
        return convertToDtoWithStats(savedCategory);
    }

    public CategoryDto updateCategory(CategoryDto categoryDto) {
        Category category = categoryRepository.findById(categoryDto.getId()).orElse(null);
        if (category == null) {
            return null;
        }
        
        category.setName(categoryDto.getName());
        category.setDescription(categoryDto.getDescription());
        category.setColor(categoryDto.getColor());
        category.setSlug(categoryDto.getName().toLowerCase().replace(" ", "-"));
        
        Category updatedCategory = categoryRepository.save(category);
        return convertToDtoWithStats(updatedCategory);
    }

    public boolean deleteCategory(Integer id) {
        if (categoryRepository.existsById(id)) {
            categoryRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Map<String, Object> getCategoryStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Tổng số thể loại
        long totalCategories = categoryRepository.count();
        stats.put("totalCategories", totalCategories);
        
        // Tổng số truyện
        Long totalStories = storyCategoryRepository.countDistinctStoryIds();
        stats.put("totalStories", totalStories != null ? totalStories : 0);
        
        // Thể loại phổ biến nhất
        String mostPopularCategory = categoryRepository.findMostPopularCategory();
        stats.put("mostPopularCategory", mostPopularCategory != null ? mostPopularCategory : "Chưa có");
        
        return stats;
    }

    private CategoryDto convertToDtoWithStats(Category category) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setColor(category.getColor());
        dto.setSlug(category.getSlug());
        
        // Đếm số truyện trong thể loại này
        Long storyCount = storyCategoryRepository.countByCategoryId(category.getId());
        dto.setStoryCount(storyCount != null ? storyCount.intValue() : 0);
        
        return dto;
    }
} 
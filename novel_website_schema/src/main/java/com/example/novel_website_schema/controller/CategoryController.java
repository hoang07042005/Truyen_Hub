package com.example.novel_website_schema.controller;

import com.example.novel_website_schema.entity.Category;
import com.example.novel_website_schema.repository.CategoryRepository;
import com.example.novel_website_schema.dto.CategoryWithCountDto;
import com.example.novel_website_schema.repository.StoryCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:3000")
public class CategoryController {
    
    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private StoryCategoryRepository storyCategoryRepository;

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/with-count")
    public ResponseEntity<List<CategoryWithCountDto>> getAllCategoriesWithCount() {
        List<Category> categories = categoryRepository.findAll();
        List<CategoryWithCountDto> result = categories.stream().map(cat -> {
            Long count = storyCategoryRepository.countByCategoryId(cat.getId());
            CategoryWithCountDto dto = new CategoryWithCountDto();
            dto.setId(cat.getId());
            dto.setName(cat.getName());
            dto.setSlug(cat.getSlug());
            dto.setStoryCount(count);
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Thể loại không tồn tại"));
        return ResponseEntity.ok(category);
    }
} 
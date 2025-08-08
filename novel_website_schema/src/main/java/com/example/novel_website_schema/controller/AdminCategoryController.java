package com.example.novel_website_schema.controller;

import com.example.novel_website_schema.dto.CategoryDto;
import com.example.novel_website_schema.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories/admin")
@CrossOrigin(origins = "*")
public class AdminCategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        try {
            List<CategoryDto> categories = categoryService.getAllCategoriesWithStats();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            System.err.println("Error fetching categories: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getCategoryStats() {
        try {
            Map<String, Object> stats = categoryService.getCategoryStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("Error fetching category stats: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDto> getCategoryById(@PathVariable Integer id) {
        try {
            CategoryDto category = categoryService.getCategoryById(id);
            if (category != null) {
                return ResponseEntity.ok(category);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error fetching category: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<CategoryDto> createCategory(@RequestBody CategoryDto categoryDto) {
        try {
            CategoryDto createdCategory = categoryService.createCategory(categoryDto);
            return ResponseEntity.ok(createdCategory);
        } catch (Exception e) {
            System.err.println("Error creating category: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDto> updateCategory(@PathVariable Integer id, @RequestBody CategoryDto categoryDto) {
        try {
            categoryDto.setId(id);
            CategoryDto updatedCategory = categoryService.updateCategory(categoryDto);
            if (updatedCategory != null) {
                return ResponseEntity.ok(updatedCategory);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error updating category: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Integer id) {
        try {
            boolean deleted = categoryService.deleteCategory(id);
            if (deleted) {
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error deleting category: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
} 
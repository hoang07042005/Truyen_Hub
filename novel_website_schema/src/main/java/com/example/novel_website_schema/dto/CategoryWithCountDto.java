package com.example.novel_website_schema.dto;

import lombok.Data;

@Data
public class CategoryWithCountDto {
    private Integer id;
    private String name;
    private String slug;
    private Long storyCount;
} 
package com.example.novel_website_schema.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "story_categories")
@IdClass(StoryCategoryId.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StoryCategory {
    @Id
    @Column(name = "story_id")
    private Integer storyId;
    
    @Id
    @Column(name = "category_id")
    private Integer categoryId;
} 
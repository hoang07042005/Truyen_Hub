package com.example.novel_website_schema.entity;

import java.io.Serializable;
import java.util.Objects;

public class StoryCategoryId implements Serializable {
    private Integer storyId;
    private Integer categoryId;

    public StoryCategoryId() {}

    public StoryCategoryId(Integer storyId, Integer categoryId) {
        this.storyId = storyId;
        this.categoryId = categoryId;
    }

    public Integer getStoryId() {
        return storyId;
    }

    public void setStoryId(Integer storyId) {
        this.storyId = storyId;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    // equals & hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        StoryCategoryId that = (StoryCategoryId) o;
        return Objects.equals(storyId, that.storyId) && Objects.equals(categoryId, that.categoryId);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(storyId, categoryId);
    }
} 
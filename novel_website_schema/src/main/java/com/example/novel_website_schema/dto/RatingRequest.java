package com.example.novel_website_schema.dto;

public class RatingRequest {
    private Integer rating;
    private String comment;

    public RatingRequest() {}

    public RatingRequest(Integer rating, String comment) {
        this.rating = rating;
        this.comment = comment;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
} 
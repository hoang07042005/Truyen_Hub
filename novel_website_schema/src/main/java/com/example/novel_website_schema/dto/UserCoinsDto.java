package com.example.novel_website_schema.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserCoinsDto {
    
    private Integer userId;
    private Integer coins;
    private String username;
    private String email;
} 
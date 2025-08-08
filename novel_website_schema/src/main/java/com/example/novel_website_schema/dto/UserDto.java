package com.example.novel_website_schema.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Integer id;
    private String username;
    private String email;
    private String avatar;
    private String role;
    private Integer points;
    private String badge;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer storiesReadCount;
} 
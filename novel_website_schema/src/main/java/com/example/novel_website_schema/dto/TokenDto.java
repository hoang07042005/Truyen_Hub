package com.example.novel_website_schema.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenDto {
    private Integer id;
    private Integer userId;
    private String token;
    private String type;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private Boolean revoked;
} 
package com.example.novel_website_schema.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoinPackageDto {
    
    private Integer id;
    private String name;
    private Integer coins;
    private BigDecimal price;
    private String currency;
    private Integer bonusCoins;
    private Boolean isActive;
    private Integer sortOrder;
    private Integer totalCoins; // coins + bonusCoins
} 
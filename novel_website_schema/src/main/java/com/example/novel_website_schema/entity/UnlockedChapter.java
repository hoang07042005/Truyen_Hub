package com.example.novel_website_schema.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "unlocked_chapters")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UnlockedChapter {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "chapter_id", nullable = false)
    private Chapter chapter;
    
    @Column(name = "coins_spent", nullable = false)
    private Integer coinsSpent;
    
    @Column(name = "unlocked_at", nullable = false)
    private LocalDateTime unlockedAt;
    
    @PrePersist
    protected void onCreate() {
        unlockedAt = LocalDateTime.now();
    }
} 
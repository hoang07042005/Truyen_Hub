package com.example.novel_website_schema.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "coin_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoinTransaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private TransactionType transactionType;
    
    @Column(name = "amount", nullable = false)
    private Integer amount;
    
    @Column(name = "balance_before", nullable = false)
    private Integer balanceBefore;
    
    @Column(name = "balance_after", nullable = false)
    private Integer balanceAfter;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "reference_id")
    private String referenceId;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    public enum TransactionType {
        PURCHASE,    // Mua tiền xu
        SPEND,       // Tiêu tiền xu
        REFUND,      // Hoàn tiền
        BONUS,       // Thưởng
        ADMIN_ADJUST // Admin điều chỉnh
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
} 
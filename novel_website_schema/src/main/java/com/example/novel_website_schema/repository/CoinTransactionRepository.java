package com.example.novel_website_schema.repository;

import com.example.novel_website_schema.entity.CoinTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CoinTransactionRepository extends JpaRepository<CoinTransaction, Integer> {
    
    Page<CoinTransaction> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    List<CoinTransaction> findByUserIdAndTransactionTypeOrderByCreatedAtDesc(Long userId, CoinTransaction.TransactionType transactionType);
    
    List<CoinTransaction> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(Long userId, LocalDateTime startDate, LocalDateTime endDate);
} 
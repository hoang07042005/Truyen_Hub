package com.example.novel_website_schema.repository;

import com.example.novel_website_schema.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    
    Page<Payment> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    List<Payment> findByUserIdAndPaymentStatus(Long userId, Payment.PaymentStatus paymentStatus);
    
    Optional<Payment> findByTransactionId(String transactionId);
    
    List<Payment> findByPaymentStatus(Payment.PaymentStatus paymentStatus);
} 
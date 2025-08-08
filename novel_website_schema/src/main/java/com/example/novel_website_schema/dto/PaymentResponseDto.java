package com.example.novel_website_schema.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponseDto {
    
    private Integer paymentId;
    private String paymentUrl;
    private String transactionId;
    private String status;
    private String message;
} 
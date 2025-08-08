package com.example.novel_website_schema.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDto {
    
    private Integer packageId;
    private Integer customAmount;
    private String paymentMethod;
    private String returnUrl;
    private String cancelUrl;
} 
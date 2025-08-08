package com.example.novel_website_schema.controller;

import com.example.novel_website_schema.config.VNPayConfig;
import com.example.novel_website_schema.dto.PaymentRequestDto;
import com.example.novel_website_schema.dto.PaymentResponseDto;
import com.example.novel_website_schema.entity.CoinPackage;
import com.example.novel_website_schema.entity.Payment;
import com.example.novel_website_schema.entity.User;
import com.example.novel_website_schema.service.CoinService;
import com.example.novel_website_schema.service.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.List;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private CoinService coinService;

    @Autowired
    private com.example.novel_website_schema.repository.CoinPackageRepository coinPackageRepository;

    @Autowired
    private com.example.novel_website_schema.repository.PaymentRepository paymentRepository;

    @Autowired
    private com.example.novel_website_schema.repository.UserRepository userRepository;

    @PostMapping("/create")
    public ResponseEntity<PaymentResponseDto> createPayment(
            @RequestBody PaymentRequestDto request,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest httpRequest) {
        
        try {
            User user = userRepository.findById(userDetails.getUserId()).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().build();
            }

            CoinPackage coinPackage = null;
            Integer customAmount = request.getCustomAmount();
            
            if (request.getPackageId() != null) {
                // Sử dụng gói có sẵn
                coinPackage = coinPackageRepository.findById(request.getPackageId()).orElse(null);
                if (coinPackage == null) {
                    return ResponseEntity.badRequest().build();
                }
            } else if (customAmount != null && customAmount >= 10000) {
                // Tạo gói tạm thời cho custom amount
                coinPackage = new CoinPackage();
                coinPackage.setName("Gói tùy chỉnh " + customAmount + "₫");
                coinPackage.setPrice(new BigDecimal(customAmount));
                coinPackage.setCurrency("VND");
                coinPackage.setIsActive(true);
                coinPackage.setSortOrder(999);
                
                // Tính số xu dựa trên số tiền (logic giống frontend)
                int coins = calculateCoinsFromAmount(customAmount);
                coinPackage.setCoins(coins);
                coinPackage.setBonusCoins(0);
            } else {
                return ResponseEntity.badRequest().build();
            }

            Payment payment = new Payment();
            payment.setUser(user);
            payment.setCoinPackage(coinPackage);
            payment.setAmount(coinPackage.getPrice());
            payment.setCurrency(coinPackage.getCurrency());
            payment.setPaymentMethod(Payment.PaymentMethod.valueOf(request.getPaymentMethod()));
            payment.setPaymentStatus(Payment.PaymentStatus.PENDING);
            payment.setTransactionId(VNPayConfig.getRandomNumber(8));
            
            payment = paymentRepository.save(payment);
            System.out.println("=== PAYMENT CREATED ===");
            System.out.println("Payment ID: " + payment.getId());
            System.out.println("Transaction ID: " + payment.getTransactionId());
            System.out.println("User ID: " + payment.getUser().getId());
            System.out.println("Amount: " + payment.getAmount());
            System.out.println("Coins: " + coinPackage.getCoins());
            System.out.println("Status: " + payment.getPaymentStatus());

            String paymentUrl = createVNPayUrl(payment, httpRequest);
            System.out.println("VNPAY Payment URL: " + paymentUrl);

            // Cập nhật payment URL
            payment.setPaymentUrl(paymentUrl);
            paymentRepository.save(payment);

            PaymentResponseDto response = new PaymentResponseDto();
            response.setPaymentId(payment.getId());
            response.setPaymentUrl(paymentUrl);
            response.setTransactionId(payment.getTransactionId());
            response.setStatus("PENDING");
            response.setMessage("Đang chuyển hướng đến cổng thanh toán...");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Tính số xu dựa trên số tiền (logic giống frontend)
     */
    private int calculateCoinsFromAmount(int amount) {
        if (amount >= 2000000) return 24000;
        if (amount >= 1000000) return 11500;
        if (amount >= 500000) return 5500;
        if (amount >= 200000) return 2150;
        if (amount >= 100000) return 1050;
        if (amount >= 50000) return 500;
        return amount / 100; // 1 xu = 100 VND
    }

    @PostMapping("/callback")
    public ResponseEntity<Map<String, Object>> paymentCallback(HttpServletRequest request) {
        return processCallback(request);
    }

    @GetMapping("/callback")
    @CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
    public ResponseEntity<Map<String, Object>> paymentCallbackGet(HttpServletRequest request) {
        return processCallback(request);
    }

    private ResponseEntity<Map<String, Object>> processCallback(HttpServletRequest request) {
        System.out.println("=== CALLBACK RECEIVED ===");
        System.out.println("Request URL: " + request.getRequestURL());
        System.out.println("Request Method: " + request.getMethod());
        System.out.println("Content Type: " + request.getContentType());
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Log tất cả parameters từ VNPAY để debug
            System.out.println("=== VNPAY CALLBACK DEBUG ===");
            System.out.println("All parameters:");
            request.getParameterMap().forEach((key, values) -> {
                System.out.println(key + " = " + String.join(", ", values));
            });
            
            String vnp_ResponseCode = request.getParameter("vnp_ResponseCode");
            String vnp_TxnRef = request.getParameter("vnp_TxnRef");
            String vnp_Amount = request.getParameter("vnp_Amount");
            String vnp_SecureHash = request.getParameter("vnp_SecureHash");

            System.out.println("vnp_ResponseCode: " + vnp_ResponseCode);
            System.out.println("vnp_TxnRef: " + vnp_TxnRef);
            System.out.println("vnp_Amount: " + vnp_Amount);
            System.out.println("vnp_SecureHash: " + vnp_SecureHash);

            // Tìm payment theo transaction ID
            Payment payment = paymentRepository.findByTransactionId(vnp_TxnRef).orElse(null);
            System.out.println("Found payment: " + (payment != null ? "YES" : "NO"));
            
            if (payment == null) {
                // Log tất cả transaction IDs trong database để debug
                System.out.println("All transaction IDs in database:");
                List<Payment> allPayments = paymentRepository.findAll();
                allPayments.forEach(p -> {
                    System.out.println("Payment ID: " + p.getId() + ", Transaction ID: " + p.getTransactionId());
                });
                
                response.put("success", false);
                response.put("message", "Không tìm thấy giao dịch");
                return ResponseEntity.ok(response);
            }

            System.out.println("Processing payment ID: " + payment.getId());

            // Kiểm tra xem payment đã được xử lý chưa để tránh duplicate
            if (payment.getPaymentStatus() == Payment.PaymentStatus.COMPLETED) {
                System.out.println("Payment already completed, skipping duplicate processing");
                response.put("success", true);
                response.put("message", "Thanh toán đã được xử lý trước đó");
                response.put("coins", payment.getCoinPackage().getCoins() + payment.getCoinPackage().getBonusCoins());
                return ResponseEntity.ok(response);
            }

            if ("00".equals(vnp_ResponseCode)) {
                payment.setPaymentStatus(Payment.PaymentStatus.COMPLETED);
                payment.setCompletedAt(java.time.LocalDateTime.now());
                paymentRepository.save(payment);

                CoinPackage coinPackage = payment.getCoinPackage();
                int totalCoins = coinPackage.getCoins() + coinPackage.getBonusCoins();
                coinService.addCoins(payment.getUser().getId(), totalCoins, 
                    "PURCHASE", "Mua gói " + coinPackage.getName());

                System.out.println("Payment successful! Added " + totalCoins + " coins");

                response.put("success", true);
                response.put("message", "Thanh toán thành công");
                response.put("coins", totalCoins);
            } else {
                payment.setPaymentStatus(Payment.PaymentStatus.FAILED);
                payment.setErrorMessage("Mã lỗi: " + vnp_ResponseCode);
                paymentRepository.save(payment);

                System.out.println("Payment failed with code: " + vnp_ResponseCode);

                response.put("success", false);
                response.put("message", "Thanh toán thất bại");
            }

        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Exception in callback: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Có lỗi xảy ra");
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<Page<Payment>> getPaymentHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Payment> payments = paymentRepository.findByUserIdOrderByCreatedAtDesc(
                userDetails.getUserId().longValue(), pageable);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Debug endpoint - xem tất cả payments (chỉ dùng cho development)
     */
    @GetMapping("/debug/all")
    public ResponseEntity<Map<String, Object>> debugAllPayments() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Payment> allPayments = paymentRepository.findAll();
            List<Map<String, Object>> paymentList = new ArrayList<>();
            
            for (Payment payment : allPayments) {
                Map<String, Object> paymentInfo = new HashMap<>();
                paymentInfo.put("id", payment.getId());
                paymentInfo.put("transactionId", payment.getTransactionId());
                paymentInfo.put("userId", payment.getUser().getId());
                paymentInfo.put("amount", payment.getAmount());
                paymentInfo.put("status", payment.getPaymentStatus());
                paymentInfo.put("createdAt", payment.getCreatedAt());
                paymentList.add(paymentInfo);
            }
            
            response.put("total", allPayments.size());
            response.put("payments", paymentList);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    private String createVNPayUrl(Payment payment, HttpServletRequest request) throws UnsupportedEncodingException {
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String orderType = "other";
        long amount = payment.getAmount().longValue() * 100;
        String bankCode = "NCB";
        
        String vnp_TxnRef = payment.getTransactionId();
        String vnp_IpAddr = VNPayConfig.getIpAddress(request);
        String vnp_TmnCode = VNPayConfig.vnp_TmnCode;
        
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_BankCode", bankCode);
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Mua xu: " + payment.getCoinPackage().getName());
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", VNPayConfig.vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
        
        List fieldNames = new ArrayList(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = VNPayConfig.hmacSHA512(VNPayConfig.secretKey, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = VNPayConfig.vnp_PayUrl + "?" + queryUrl;
        
        return paymentUrl;
    }
} 
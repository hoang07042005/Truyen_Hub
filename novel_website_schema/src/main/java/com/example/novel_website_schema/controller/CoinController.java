package com.example.novel_website_schema.controller;

import com.example.novel_website_schema.dto.UserCoinsDto;
import com.example.novel_website_schema.service.CoinService;
import com.example.novel_website_schema.service.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coins")
@CrossOrigin(origins = "*")
public class CoinController {
    
    @Autowired
    private CoinService coinService;
    
    /**
     * Lấy thông tin tiền xu của user hiện tại
     */
    @GetMapping("/balance")
    public ResponseEntity<UserCoinsDto> getMyCoins(@AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            UserCoinsDto userCoins = coinService.getUserCoins(userDetails.getUserId());
            return ResponseEntity.ok(userCoins);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Kiểm tra có đủ tiền xu để mở khóa chapter không
     */
    @GetMapping("/check/{chapterId}")
    public ResponseEntity<Boolean> checkEnoughCoins(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Integer chapterId) {
        try {
            // TODO: Lấy coins required từ chapter
            Integer coinsRequired = 10; // Tạm thời hardcode
            boolean hasEnough = coinService.hasEnoughCoins(userDetails.getUserId(), coinsRequired);
            return ResponseEntity.ok(hasEnough);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 
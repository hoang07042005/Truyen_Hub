package com.example.novel_website_schema.controller;

import com.example.novel_website_schema.dto.AuthRequest;
import com.example.novel_website_schema.dto.AuthResponse;
import com.example.novel_website_schema.dto.ChangePasswordRequest;
import com.example.novel_website_schema.dto.ForgotPasswordRequest;
import com.example.novel_website_schema.dto.MessageResponse;
import com.example.novel_website_schema.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public AuthResponse register(@RequestBody AuthRequest request) {
        return userService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        return userService.login(request);
    }

    @PostMapping("/change-password")
    public MessageResponse changePassword(@RequestBody ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        // Lấy userId từ JWT token (cần implement cách lấy userId từ authentication)
        // Tạm thời sử dụng username để tìm user
        return userService.changePasswordByUsername(username, request);
    }

    @PostMapping("/forgot-password")
    public MessageResponse forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return userService.forgotPassword(request);
    }

    @PostMapping("/reset-password")
    public MessageResponse resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        return userService.resetPassword(token, newPassword);
    }
} 
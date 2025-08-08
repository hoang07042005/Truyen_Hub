package com.example.novel_website_schema.controller;

import com.example.novel_website_schema.entity.User;
import com.example.novel_website_schema.repository.UserRepository;
import com.example.novel_website_schema.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.example.novel_website_schema.service.CustomUserDetails;
import com.example.novel_website_schema.dto.UserDto;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserService userService;

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    public Optional<User> getUserById(@PathVariable Integer id) {
        return userRepository.findById(id);
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userRepository.save(user);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Integer id) {
        userRepository.deleteById(id);
    }

    @GetMapping("/me")
    public UserDto getCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new RuntimeException("Chưa đăng nhập");
        }
        User user = userService.getUserWithPoints(userDetails.getUser().getId());
        return new UserDto(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getAvatar(),
            user.getRole() != null ? user.getRole().name() : null,
            user.getPoints(),
            user.getBadge(),
            user.getCreatedAt(),
            user.getUpdatedAt(),
            0
        );
    }

    @PatchMapping("/me")
    public UserDto updateCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails, @RequestBody UserDto updateDto) {
        if (userDetails == null) {
            throw new RuntimeException("Chưa đăng nhập");
        }
        User user = userDetails.getUser();
        // Chỉ cho phép cập nhật email, avatar, username (nếu muốn)
        if (updateDto.getEmail() != null) user.setEmail(updateDto.getEmail());
        if (updateDto.getAvatar() != null) user.setAvatar(updateDto.getAvatar());
        if (updateDto.getUsername() != null) user.setUsername(updateDto.getUsername());
        userRepository.save(user);
        
        // Lấy user với điểm đã cập nhật
        User updatedUser = userService.getUserWithPoints(user.getId());
        return new UserDto(
            updatedUser.getId(),
            updatedUser.getUsername(),
            updatedUser.getEmail(),
            updatedUser.getAvatar(),
            updatedUser.getRole() != null ? updatedUser.getRole().name() : null,
            updatedUser.getPoints(),
            updatedUser.getBadge(),
            updatedUser.getCreatedAt(),
            updatedUser.getUpdatedAt(),
            0
        );
    }
} 
package com.example.novel_website_schema.service;

import com.example.novel_website_schema.dto.AuthRequest;
import com.example.novel_website_schema.dto.AuthResponse;
import com.example.novel_website_schema.dto.ChangePasswordRequest;
import com.example.novel_website_schema.dto.ForgotPasswordRequest;
import com.example.novel_website_schema.dto.MessageResponse;
import com.example.novel_website_schema.entity.User;
import com.example.novel_website_schema.entity.Token;
import com.example.novel_website_schema.repository.UserRepository;
import com.example.novel_website_schema.repository.TokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
import com.example.novel_website_schema.entity.Activity;
import com.example.novel_website_schema.dto.UserDto;
import com.example.novel_website_schema.repository.HistoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class UserService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TokenRepository tokenRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private JavaMailSender mailSender;
    @Autowired
    private HistoryRepository historyRepository;

    @Autowired
    private ActivityService activityService;

    // Constants for points calculation
    private static final int POINTS_PER_VIEW = 1;
    private static final int POINTS_PER_LIKE = 5;
    private static final int POINTS_PER_COMMENT = 10;
    private static final int POINTS_PER_BOOKMARK = 3;
    private static final int POINTS_PER_RATING = 2;

    public AuthResponse register(AuthRequest request) {
        // Kiểm tra trùng username/email
        if (userRepository.findByUsername(request.getUsername()).isPresent() ||
                userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Username hoặc email đã tồn tại");
        }
        // Tạo user mới
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.USER);
        user = userRepository.save(user);
        
        // Log user registration activity
        activityService.logActivity(
            Activity.ActivityType.USER_REGISTRATION,
            "Người dùng mới đăng ký: " + request.getEmail(),
            user.getId()
        );
        
        // Sinh JWT
        String jwt = jwtUtil.generateToken(user);
        // Lưu token
        Token token = new Token();
        token.setUserId(user.getId());
        token.setToken(jwt);
        token.setType(Token.TokenType.ACCESS);
        token.setExpiresAt(java.time.LocalDateTime.now().plusDays(1));
        token.setRevoked(false);
        // createdAt sẽ được set tự động bởi @PrePersist
        tokenRepository.save(token);
        // Trả về AuthResponse
        return new AuthResponse(jwt, user.getId(), user.getUsername(), user.getEmail(), user.getAvatar(),
                user.getRole().name());
    }

    public AuthResponse login(AuthRequest request) {
        // Tìm user theo username hoặc email
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isEmpty() && request.getEmail() != null) {
            userOpt = userRepository.findByEmail(request.getEmail());
        }
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Tài khoản không tồn tại");
        }
        User user = userOpt.get();
        // Kiểm tra password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Sai mật khẩu");
        }
        
        // Log user login activity
        activityService.logActivity(
            Activity.ActivityType.USER_LOGIN,
            "Người dùng đăng nhập: " + user.getEmail(),
            user.getId()
        );
        
        // Sinh JWT
        String jwt = jwtUtil.generateToken(user);
        // Lưu token
        Token token = new Token();
        token.setUserId(user.getId());
        token.setToken(jwt);
        token.setType(Token.TokenType.ACCESS);
        token.setExpiresAt(java.time.LocalDateTime.now().plusDays(1));
        token.setRevoked(false);
        // createdAt sẽ được set tự động bởi @PrePersist
        tokenRepository.save(token);
        // Trả về AuthResponse
        return new AuthResponse(jwt, user.getId(), user.getUsername(), user.getEmail(), user.getAvatar(),
                user.getRole().name());
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return new CustomUserDetails(user);
    }

    public MessageResponse changePassword(Integer userId, ChangePasswordRequest request) {
        // Tìm user theo ID
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Người dùng không tồn tại");
        }
        
        User user = userOpt.get();
        
        // Kiểm tra mật khẩu hiện tại
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng");
        }
        
        // Kiểm tra mật khẩu mới không được trùng với mật khẩu cũ
        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu mới không được trùng với mật khẩu hiện tại");
        }
        
        // Cập nhật mật khẩu mới
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        // Revoke tất cả token cũ của user (để force logout)
        tokenRepository.revokeAllTokensByUserId(userId);
        
        return new MessageResponse("Đổi mật khẩu thành công", true);
    }

    public MessageResponse changePasswordByUsername(String username, ChangePasswordRequest request) {
        // Tìm user theo username
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Người dùng không tồn tại");
        }
        
        User user = userOpt.get();
        
        // Kiểm tra mật khẩu hiện tại
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng");
        }
        
        // Kiểm tra mật khẩu mới không được trùng với mật khẩu cũ
        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu mới không được trùng với mật khẩu hiện tại");
        }
        
        // Cập nhật mật khẩu mới
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        // Revoke tất cả token cũ của user (để force logout)
        tokenRepository.revokeAllTokensByUserId(user.getId());
        
        return new MessageResponse("Đổi mật khẩu thành công", true);
    }

    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        // Tìm user theo email
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            // Không trả về lỗi để tránh leak thông tin
            return new MessageResponse("Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn", true);
        }
        
        User user = userOpt.get();
        
        // Tạo reset token
        String resetToken = jwtUtil.generateResetToken(user);
        
        // Lưu reset token vào database
        Token token = new Token();
        token.setUserId(user.getId());
        token.setToken(resetToken);
        token.setType(Token.TokenType.RESET);
        token.setExpiresAt(java.time.LocalDateTime.now().plusHours(1)); // Token hết hạn sau 1 giờ
        token.setRevoked(false);
        tokenRepository.save(token);
        
        // Gửi email HTML với reset link có thể click được
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(request.getEmail());
            helper.setSubject("Đặt lại mật khẩu - Novel Website");
            
            String resetLink = "http://localhost:3000/reset-password?token=" + resetToken;
            
            String htmlContent = "<!DOCTYPE html>" +
                    "<html>" +
                    "<head>" +
                    "<meta charset='UTF-8'>" +
                    "<style>" +
                    "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                    ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                    ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }" +
                    ".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }" +
                    ".button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }" +
                    ".button:hover { background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%); }" +
                    ".warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }" +
                    ".footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }" +
                    "</style>" +
                    "</head>" +
                    "<body>" +
                    "<div class='container'>" +
                    "<div class='header'>" +
                    "<h1>Đặt lại mật khẩu</h1>" +
                    "</div>" +
                    "<div class='content'>" +
                    "<p>Xin chào <strong>" + user.getUsername() + "</strong>,</p>" +
                    "<p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>" +
                    "<p>Vui lòng click vào nút bên dưới để đặt lại mật khẩu:</p>" +
                    "<div style='text-align: center;'>" +
                    "<a href='" + resetLink + "' class='button'>Đặt lại mật khẩu</a>" +
                    "</div>" +
                    "<p>Hoặc copy link sau vào trình duyệt:</p>" +
                    "<p style='word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px;'>" +
                    "<a href='" + resetLink + "'>" + resetLink + "</a>" +
                    "</p>" +
                    "<div class='warning'>" +
                    "<strong>⚠️ Lưu ý:</strong> Link này sẽ hết hạn sau 1 giờ." +
                    "</div>" +
                    "<p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>" +
                    "</div>" +
                    "<div class='footer'>" +
                    "<p>Trân trọng,<br><strong>Novel Website Team</strong></p>" +
                    "</div>" +
                    "</div>" +
                    "</body>" +
                    "</html>";
            
            helper.setText(htmlContent, true); // true = HTML content
            mailSender.send(message);
            
            System.out.println("=== HTML EMAIL SENT ===");
            System.out.println("To: " + request.getEmail());
            System.out.println("Reset link: " + resetLink);
            System.out.println("=======================");
            
        } catch (Exception e) {
            System.err.println("Lỗi gửi email: " + e.getMessage());
            // Vẫn trả về thành công để không leak thông tin
        }
        
        return new MessageResponse("Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn", true);
    }

    public MessageResponse resetPassword(String resetToken, String newPassword) {
        try {
            // Tìm token trong database
            Optional<Token> tokenOpt = tokenRepository.findByTokenAndTypeAndRevokedFalse(resetToken, Token.TokenType.RESET);
            if (tokenOpt.isEmpty()) {
                throw new RuntimeException("Token không hợp lệ hoặc đã hết hạn");
            }
            
            Token token = tokenOpt.get();
            
            // Kiểm tra token có hết hạn chưa
            if (token.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
                throw new RuntimeException("Token đã hết hạn");
            }
            
            // Tìm user
            Optional<User> userOpt = userRepository.findById(token.getUserId());
            if (userOpt.isEmpty()) {
                throw new RuntimeException("Người dùng không tồn tại");
            }
            
            User user = userOpt.get();
            
            // Cập nhật mật khẩu mới
            user.setPasswordHash(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            
            // Revoke token này
            token.setRevoked(true);
            tokenRepository.save(token);
            
            // Revoke tất cả token khác của user (nếu có)
            try {
                tokenRepository.revokeAllTokensByUserId(user.getId());
            } catch (Exception e) {
                System.err.println("Warning: Could not revoke all tokens: " + e.getMessage());
                // Không throw exception vì đây không phải lỗi nghiêm trọng
            }
            
            return new MessageResponse("Đặt lại mật khẩu thành công", true);
            
        } catch (RuntimeException e) {
            throw e; // Re-throw RuntimeException
        } catch (Exception e) {
            System.err.println("Error in resetPassword: " + e.getMessage());
            throw new RuntimeException("Lỗi khi đặt lại mật khẩu: " + e.getMessage());
        }
    }

    // Method to calculate and update user points
    public void updateUserPoints(Integer userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return;
        }
        
        User user = userOpt.get();
        int totalPoints = calculateUserPoints(userId);
        user.setPoints(totalPoints);
        userRepository.save(user);
    }

    // Method to calculate user points based on activities
    private int calculateUserPoints(Integer userId) {
        int points = 0;
        
        // Points from views (StoryView + ChapterView)
        // Note: This would need to be implemented with actual repository calls
        // For now, we'll use a simple calculation
        
        // Points from likes
        // Points from comments  
        // Points from bookmarks
        // Points from ratings
        
        // For demonstration, we'll return a calculated value
        // In a real implementation, you would query the actual data
        points = userId * 10 + 100; // Simple calculation for demo
        
        return points;
    }

    // Method to get user with calculated points
    public User getUserWithPoints(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        updateUserPoints(userId);
        return userRepository.findById(userId).orElse(user);
    }

    public long getActiveUsersCount() {
        // For now, return total users count
        // TODO: Implement logic to count users who logged in within last 30 days
        return userRepository.count();
    }

    public Page<UserDto> getAllUsers(Pageable pageable) {
        Page<User> users = userRepository.findAll(pageable);
        return users.map(this::convertToDTO);
    }

    public Page<UserDto> searchUsers(String search, String status, Pageable pageable) {
        Page<User> users;
        if (!search.isEmpty() && !status.isEmpty()) {
            users = userRepository.findByUsernameContainingIgnoreCaseAndRole(search, User.Role.valueOf(status), pageable);
        } else if (!search.isEmpty()) {
            users = userRepository.findByUsernameContainingIgnoreCase(search, pageable);
        } else if (!status.isEmpty()) {
            users = userRepository.findByRole(User.Role.valueOf(status), pageable);
        } else {
            users = userRepository.findAll(pageable);
        }
        return users.map(this::convertToDTO);
    }

    public UserDto getUserById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
        return convertToDTO(user);
    }

    public UserDto updateUser(Integer id, UserDto userDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
        
        user.setUsername(userDto.getUsername());
        user.setEmail(userDto.getEmail());
        user.setRole(User.Role.valueOf(userDto.getRole()));
        
        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    public void updateUserRole(Integer id, String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
        
        user.setRole(User.Role.valueOf(role));
        userRepository.save(user);
    }

    public void deleteUser(Integer id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Người dùng không tồn tại");
        }
        userRepository.deleteById(id);
    }
    
    private UserDto convertToDTO(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setAvatar(user.getAvatar());
        dto.setCreatedAt(user.getCreatedAt());
        
        // Get stories read count
        Long storiesRead = historyRepository.countByUserId(user.getId());
        dto.setStoriesReadCount(storiesRead != null ? storiesRead.intValue() : 0);
        
        return dto;
    }
}

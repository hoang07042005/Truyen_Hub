package com.example.novel_website_schema.repository;

import com.example.novel_website_schema.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
 
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    
    Page<User> findByUsernameContainingIgnoreCase(String username, Pageable pageable);
    Page<User> findByRole(User.Role role, Pageable pageable);
    Page<User> findByUsernameContainingIgnoreCaseAndRole(String username, User.Role role, Pageable pageable);
} 
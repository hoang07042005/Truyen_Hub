package com.example.novel_website_schema.repository;

import com.example.novel_website_schema.entity.UserCoins;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserCoinsRepository extends JpaRepository<UserCoins, Integer> {
    
    Optional<UserCoins> findByUserId(Integer userId);
    
    boolean existsByUserId(Integer userId);
} 
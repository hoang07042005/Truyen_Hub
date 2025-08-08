package com.example.novel_website_schema.repository;

import com.example.novel_website_schema.entity.Token;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
 
public interface TokenRepository extends JpaRepository<Token, Integer> {
    List<Token> findByUserIdAndRevokedFalse(Integer userId);
    
    Optional<Token> findByTokenAndTypeAndRevokedFalse(String token, Token.TokenType type);
    
    @Modifying
    @Transactional
    @Query("UPDATE Token t SET t.revoked = true WHERE t.userId = :userId")
    void revokeAllTokensByUserId(@Param("userId") Integer userId);
} 
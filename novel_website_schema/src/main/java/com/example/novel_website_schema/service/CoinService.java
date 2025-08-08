package com.example.novel_website_schema.service;

import com.example.novel_website_schema.dto.UserCoinsDto;
import com.example.novel_website_schema.entity.CoinTransaction;
import com.example.novel_website_schema.entity.User;
import com.example.novel_website_schema.entity.UserCoins;
import com.example.novel_website_schema.repository.CoinTransactionRepository;
import com.example.novel_website_schema.repository.UserCoinsRepository;
import com.example.novel_website_schema.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CoinService {
    
    @Autowired
    private UserCoinsRepository userCoinsRepository;
    
    @Autowired
    private CoinTransactionRepository coinTransactionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Lấy thông tin tiền xu của user
     */
    public UserCoinsDto getUserCoins(Integer userId) {
        Optional<UserCoins> userCoinsOpt = userCoinsRepository.findByUserId(userId);
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        Integer coins = userCoinsOpt.map(UserCoins::getCoins).orElse(0);
        
        return new UserCoinsDto(userId, coins, user.getUsername(), user.getEmail());
    }
    
    /**
     * Thêm tiền xu cho user
     */
    @Transactional
    public void addCoins(Integer userId, Integer amount, String description, String referenceId) {
        UserCoins userCoins = getUserCoinsOrCreate(userId);
        Integer balanceBefore = userCoins.getCoins();
        Integer balanceAfter = balanceBefore + amount;
        
        userCoins.setCoins(balanceAfter);
        userCoinsRepository.save(userCoins);
        
        // Tạo transaction record
        CoinTransaction transaction = new CoinTransaction();
        transaction.setUser(userRepository.findById(userId).orElseThrow());
        transaction.setTransactionType(CoinTransaction.TransactionType.PURCHASE);
        transaction.setAmount(amount);
        transaction.setBalanceBefore(balanceBefore);
        transaction.setBalanceAfter(balanceAfter);
        transaction.setDescription(description);
        transaction.setReferenceId(referenceId);
        
        coinTransactionRepository.save(transaction);
    }
    
    /**
     * Trừ tiền xu của user
     */
    @Transactional
    public boolean spendCoins(Integer userId, Integer amount, String description, String referenceId) {
        UserCoins userCoins = getUserCoinsOrCreate(userId);
        Integer balanceBefore = userCoins.getCoins();
        
        if (balanceBefore < amount) {
            return false; // Không đủ tiền xu
        }
        
        Integer balanceAfter = balanceBefore - amount;
        userCoins.setCoins(balanceAfter);
        userCoinsRepository.save(userCoins);
        
        // Tạo transaction record
        CoinTransaction transaction = new CoinTransaction();
        transaction.setUser(userRepository.findById(userId).orElseThrow());
        transaction.setTransactionType(CoinTransaction.TransactionType.SPEND);
        transaction.setAmount(-amount);
        transaction.setBalanceBefore(balanceBefore);
        transaction.setBalanceAfter(balanceAfter);
        transaction.setDescription(description);
        transaction.setReferenceId(referenceId);
        
        coinTransactionRepository.save(transaction);
        return true;
    }
    
    /**
     * Kiểm tra user có đủ tiền xu không
     */
    public boolean hasEnoughCoins(Integer userId, Integer requiredAmount) {
        Optional<UserCoins> userCoinsOpt = userCoinsRepository.findByUserId(userId);
        Integer currentCoins = userCoinsOpt.map(UserCoins::getCoins).orElse(0);
        return currentCoins >= requiredAmount;
    }
    
    /**
     * Lấy hoặc tạo UserCoins cho user
     */
    private UserCoins getUserCoinsOrCreate(Integer userId) {
        return userCoinsRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserCoins newUserCoins = new UserCoins();
                    newUserCoins.setUser(userRepository.findById(userId).orElseThrow());
                    newUserCoins.setCoins(0);
                    return userCoinsRepository.save(newUserCoins);
                });
    }
} 
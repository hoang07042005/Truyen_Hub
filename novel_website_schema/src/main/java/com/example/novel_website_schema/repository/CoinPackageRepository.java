package com.example.novel_website_schema.repository;

import com.example.novel_website_schema.entity.CoinPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CoinPackageRepository extends JpaRepository<CoinPackage, Integer> {
    
    List<CoinPackage> findByIsActiveTrueOrderBySortOrderAsc();
    
    List<CoinPackage> findByIsActiveTrueAndCurrencyOrderBySortOrderAsc(String currency);
} 
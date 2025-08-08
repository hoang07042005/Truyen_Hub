package com.example.novel_website_schema.controller;

import com.example.novel_website_schema.dto.CoinPackageDto;
import com.example.novel_website_schema.entity.CoinPackage;
import com.example.novel_website_schema.repository.CoinPackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/coin-packages")
@CrossOrigin(origins = "*")
public class CoinPackageController {
    
    @Autowired
    private CoinPackageRepository coinPackageRepository;
    
    /**
     * Lấy danh sách gói tiền xu
     */
    @GetMapping
    public ResponseEntity<List<CoinPackageDto>> getPackages() {
        try {
            List<CoinPackage> packages = coinPackageRepository.findByIsActiveTrueOrderBySortOrderAsc();
            
            List<CoinPackageDto> packageDtos = packages.stream()
                .map(pkg -> {
                    CoinPackageDto dto = new CoinPackageDto();
                    dto.setId(pkg.getId());
                    dto.setName(pkg.getName());
                    dto.setCoins(pkg.getCoins());
                    dto.setPrice(pkg.getPrice());
                    dto.setCurrency(pkg.getCurrency());
                    dto.setBonusCoins(pkg.getBonusCoins());
                    dto.setIsActive(pkg.getIsActive());
                    dto.setSortOrder(pkg.getSortOrder());
                    dto.setTotalCoins(pkg.getCoins() + pkg.getBonusCoins());
                    return dto;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(packageDtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Lấy gói tiền xu theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<CoinPackageDto> getPackageById(@PathVariable Integer id) {
        try {
            CoinPackage pkg = coinPackageRepository.findById(id).orElse(null);
            if (pkg == null) {
                return ResponseEntity.notFound().build();
            }
            
            CoinPackageDto dto = new CoinPackageDto();
            dto.setId(pkg.getId());
            dto.setName(pkg.getName());
            dto.setCoins(pkg.getCoins());
            dto.setPrice(pkg.getPrice());
            dto.setCurrency(pkg.getCurrency());
            dto.setBonusCoins(pkg.getBonusCoins());
            dto.setIsActive(pkg.getIsActive());
            dto.setSortOrder(pkg.getSortOrder());
            dto.setTotalCoins(pkg.getCoins() + pkg.getBonusCoins());
            
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 
package com.coupon.backend.controller;

import com.coupon.backend.dto.LogHistoryResponseDto;
import com.coupon.backend.entity.LogHistory;
import com.coupon.backend.service.LogHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/logs")
@CrossOrigin(origins = {"https://dealvista.vercel.app", "http://localhost:5173", "http://localhost:3000", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class LogHistoryController {

    @Autowired
    private LogHistoryService logHistoryService;

    /**
     * Get all logs (sorted by newest first) - returns DTO without userId
     */
    @GetMapping
    public ResponseEntity<List<LogHistoryResponseDto>> getAllLogs() {
        List<LogHistory> logs = logHistoryService.getAllLogs();
        List<LogHistoryResponseDto> response = logs.stream()
            .map(log -> new LogHistoryResponseDto(log.getId(), log.getMessage(), log.getCreatedAt()))
            .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Get all logs with pagination
     * Example: GET /api/logs/paginated?page=0&size=20&sort=createdAt,desc
     */
    @GetMapping("/paginated")
    public ResponseEntity<Map<String, Object>> getAllLogsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort) {
        
        Sort.Direction direction = sort[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort[0]));
        
        Page<LogHistory> logsPage = logHistoryService.getAllLogs(pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("logs", logsPage.getContent());
        response.put("currentPage", logsPage.getNumber());
        response.put("totalItems", logsPage.getTotalElements());
        response.put("totalPages", logsPage.getTotalPages());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get log by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<LogHistory> getLogById(@PathVariable String id) {
        LogHistory log = logHistoryService.getLogById(UUID.fromString(id));
        if (log != null) {
            return ResponseEntity.ok(log);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Get logs by user ID
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LogHistory>> getLogsByUserId(@PathVariable String userId) {
        List<LogHistory> logs = logHistoryService.getLogsByUserId(UUID.fromString(userId));
        return ResponseEntity.ok(logs);
    }

    /**
     * Create a new log entry
     */
    @PostMapping
    public ResponseEntity<LogHistory> createLog(@RequestBody Map<String, String> payload) {
        String message = payload.get("message");
        String userIdStr = payload.get("userId");
        
        if (message == null || userIdStr == null) {
            return ResponseEntity.badRequest().build();
        }
        
        UUID userId = UUID.fromString(userIdStr);
        LogHistory log = logHistoryService.createLog(message, userId);
        return ResponseEntity.ok(log);
    }

    /**
     * Delete a log entry
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLog(@PathVariable String id) {
        logHistoryService.deleteLog(UUID.fromString(id));
        return ResponseEntity.noContent().build();
    }

    /**
     * Get logs count
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getLogsCount() {
        long count = logHistoryService.countLogs();
        Map<String, Long> response = new HashMap<>();
        response.put("totalLogs", count);
        return ResponseEntity.ok(response);
    }

    /**
     * Get logs count for a specific user
     */
    @GetMapping("/count/user/{userId}")
    public ResponseEntity<Map<String, Long>> getLogsCountByUserId(@PathVariable String userId) {
        long count = logHistoryService.countLogsByUserId(UUID.fromString(userId));
        Map<String, Long> response = new HashMap<>();
        response.put("userLogs", count);
        return ResponseEntity.ok(response);
    }
}

package com.coupon.backend.service;

import com.coupon.backend.entity.LogHistory;
import com.coupon.backend.repository.LogHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class LogHistoryService {

    @Autowired
    private LogHistoryRepository logHistoryRepository;

    public LogHistory createLog(String message, UUID userId) {
        LogHistory log = new LogHistory();
        log.setMessage(message);
        log.setUserId(userId);
        return logHistoryRepository.save(log);
    }

    public List<LogHistory> getAllLogs() {
        return logHistoryRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public Page<LogHistory> getAllLogs(Pageable pageable) {
        return logHistoryRepository.findAll(pageable);
    }

    public List<LogHistory> getLogsByUserId(UUID userId) {
        return logHistoryRepository.findByUserId(userId);
    }

    public LogHistory getLogById(UUID logId) {
        return logHistoryRepository.findById(logId).orElse(null);
    }

    public void deleteLog(UUID logId) {
        logHistoryRepository.deleteById(logId);
    }

    public void deleteLogsByUserId(UUID userId) {
        List<LogHistory> userLogs = logHistoryRepository.findByUserId(userId);
        logHistoryRepository.deleteAll(userLogs);
    }

    public long countLogs() {
        return logHistoryRepository.count();
    }

    public long countLogsByUserId(UUID userId) {
        return logHistoryRepository.findByUserId(userId).size();
    }
}

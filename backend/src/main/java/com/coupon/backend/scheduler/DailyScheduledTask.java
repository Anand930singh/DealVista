package com.coupon.backend.scheduler;

import com.coupon.backend.service.DailyReportService;
import com.coupon.backend.service.LogHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class DailyScheduledTask {

    @Autowired
    private DailyReportService dailyReportService;

    @Autowired
    private LogHistoryService logHistoryService;

    @Async("scheduledTaskExecutor")
    @Scheduled(cron = "0 59 23 * * *")
    public void runDailyTask() {
        try {
            dailyReportService.generateAndSendDailyReport();
        } catch (Exception e) {
            logHistoryService.createLog("Daily scheduled task failed: " + e.getMessage(), null);
        }
    }
}

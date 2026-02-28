package com.coupon.backend.service;

import com.coupon.backend.entity.UserDetail;
import com.coupon.backend.repository.CouponRedemptionRepository;
import com.coupon.backend.repository.CouponRepository;
import com.coupon.backend.repository.UserDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class DailyReportService {

    @Autowired
    private UserDetailRepository userDetailRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private CouponRedemptionRepository couponRedemptionRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private LogHistoryService logHistoryService;


    public void generateAndSendDailyReport() {
        Instant startOfDay = LocalDateTime.now()
                .truncatedTo(ChronoUnit.DAYS)
                .atZone(ZoneId.systemDefault())
                .toInstant();

        Instant endOfDay = LocalDateTime.now()
                .plusDays(1)
                .truncatedTo(ChronoUnit.DAYS)
                .atZone(ZoneId.systemDefault())
                .toInstant();

        long newRegistrations = userDetailRepository.countByCreatedAtBetween(startOfDay, endOfDay);
        long newCouponsAdded = couponRepository.countByCreatedAtBetween(startOfDay, endOfDay);
        long totalRedeemed = couponRedemptionRepository.countByRedeemedAtBetween(startOfDay, endOfDay);

        List<UserDetail> admins = userDetailRepository.findByRole("ADMIN");

        if (admins.isEmpty()) {
            return;
        }

        String today = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"));
        String subject = "DealVista Daily Report - " + today;
        String htmlBody = buildHtmlEmailBody(today, newRegistrations, newCouponsAdded, totalRedeemed);

        for (UserDetail admin : admins) {
            try {
                emailService.sendHtmlEmail(admin.getEmail(), subject, htmlBody);
                
                String logMessage = String.format(
                    "Daily report sent: Registrations=%d, Coupons=%d, Redeemed=%d - Sent to %s",
                    newRegistrations, newCouponsAdded, totalRedeemed, admin.getEmail()
                );
                logHistoryService.createLog(logMessage, admin.getId());
            } catch (Exception e) {
                String errorMessage = String.format(
                    "Failed to send daily report to %s: %s",
                    admin.getEmail(), e.getMessage()
                );
                logHistoryService.createLog(errorMessage, admin.getId());
            }
        }
    }

    private String buildHtmlEmailBody(String date, long registrations, long coupons, long redemptions) {
        return String.format("""
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>DealVista Daily Report</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
                    <table width="100%%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
                        <tr>
                            <td align="center">
                                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    <!-- Header -->
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding: 30px; text-align: center;">
                                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                                                📊 DealVista Daily Report
                                            </h1>
                                            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">
                                                %s
                                            </p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Content -->
                                    <tr>
                                        <td style="padding: 30px;">
                                            <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 20px;">
                                                Today's Statistics
                                            </h2>
                                            
                                            <!-- Statistics Cards -->
                                            <table width="100%%" cellpadding="0" cellspacing="0">
                                                <!-- New Registrations -->
                                                <tr>
                                                    <td style="padding: 15px; background-color: #e8f5e9; border-radius: 6px; margin-bottom: 10px;">
                                                        <table width="100%%" cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <td style="width: 50px; text-align: center; font-size: 30px;">
                                                                    👥
                                                                </td>
                                                                <td>
                                                                    <p style="margin: 0; color: #666; font-size: 14px;">New User Registrations</p>
                                                                    <h3 style="margin: 5px 0 0 0; color: #2e7d32; font-size: 32px; font-weight: bold;">
                                                                        %d
                                                                    </h3>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                
                                                <tr><td style="height: 15px;"></td></tr>
                                                
                                                <!-- New Coupons -->
                                                <tr>
                                                    <td style="padding: 15px; background-color: #e3f2fd; border-radius: 6px; margin-bottom: 10px;">
                                                        <table width="100%%" cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <td style="width: 50px; text-align: center; font-size: 30px;">
                                                                    🎟️
                                                                </td>
                                                                <td>
                                                                    <p style="margin: 0; color: #666; font-size: 14px;">New Coupons Added</p>
                                                                    <h3 style="margin: 5px 0 0 0; color: #1565c0; font-size: 32px; font-weight: bold;">
                                                                        %d
                                                                    </h3>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                
                                                <tr><td style="height: 15px;"></td></tr>
                                                
                                                <!-- Total Redeemed -->
                                                <tr>
                                                    <td style="padding: 15px; background-color: #fff3e0; border-radius: 6px;">
                                                        <table width="100%%" cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <td style="width: 50px; text-align: center; font-size: 30px;">
                                                                    ✅
                                                                </td>
                                                                <td>
                                                                    <p style="margin: 0; color: #666; font-size: 14px;">Total Coupons Redeemed</p>
                                                                    <h3 style="margin: 5px 0 0 0; color: #e65100; font-size: 32px; font-weight: bold;">
                                                                        %d
                                                                    </h3>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    
                                    <!-- Footer -->
                                    <tr>
                                        <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                                            <p style="margin: 0; color: #666; font-size: 14px;">
                                                This is an automated daily report from DealVista
                                            </p>
                                            <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">
                                                © 2026 DealVista. All rights reserved.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """,
                date, registrations, coupons, redemptions);
    }
}

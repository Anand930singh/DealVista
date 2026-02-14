package com.coupon.backend.util;

import java.util.Random;

public class ReferralCodeGenerator {
    
    private static final String ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int CODE_LENGTH = 8;
    private static final Random RANDOM = new Random();

    /**
     * Generates a unique 8-digit alphanumeric referral code
     * @return a random 8-character alphanumeric code
     */
    public static String generateReferralCode() {
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < CODE_LENGTH; i++) {
            code.append(ALPHANUMERIC.charAt(RANDOM.nextInt(ALPHANUMERIC.length())));
        }
        return code.toString();
    }
}

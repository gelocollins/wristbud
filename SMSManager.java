package angelo.collins.smssender;


import android.content.Context;
import android.telephony.SmsManager;
import android.util.Log;

import java.util.ArrayList;

public class SMSManager {
    private static final String TAG = "SMSManager";
    private static final int MAX_SMS_LENGTH = 160;
    
    private Context context;
    private SmsManager smsManager;
    
    public SMSManager(Context context) {
        this.context = context;
        this.smsManager = SmsManager.getDefault();
    }
    
    /**
     * Send SMS message to the specified phone number
     * Handles long messages by splitting them into multiple parts
     */
    public boolean sendSMS(String phoneNumber, String message) {
        try {
            Log.d(TAG, "Attempting to send SMS to: " + phoneNumber);
            Log.d(TAG, "Message: " + message);
            
            // Validate phone number
            if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
                Log.e(TAG, "Invalid phone number");
                return false;
            }
            
            // Clean phone number (remove spaces, dashes, etc.)
            phoneNumber = cleanPhoneNumber(phoneNumber);
            
            // Validate message
            if (message == null || message.trim().isEmpty()) {
                Log.e(TAG, "Empty message");
                return false;
            }
            
            // Check if message needs to be split
            if (message.length() <= MAX_SMS_LENGTH) {
                // Send single SMS
                smsManager.sendTextMessage(phoneNumber, null, message, null, null);
                Log.i(TAG, "Single SMS sent successfully to: " + phoneNumber);
            } else {
                // Split long message into multiple parts
                ArrayList<String> messageParts = smsManager.divideMessage(message);
                smsManager.sendMultipartTextMessage(phoneNumber, null, messageParts, null, null);
                Log.i(TAG, "Multi-part SMS (" + messageParts.size() + " parts) sent successfully to: " + phoneNumber);
            }
            
            return true;
            
        } catch (SecurityException e) {
            Log.e(TAG, "SMS permission not granted", e);
            return false;
        } catch (Exception e) {
            Log.e(TAG, "Failed to send SMS", e);
            return false;
        }
    }
    
    /**
     * Clean phone number by removing non-digit characters except + at the beginning
     */
    private String cleanPhoneNumber(String phoneNumber) {
        if (phoneNumber == null) return null;
        
        // Remove all non-digit characters except + at the beginning
        String cleaned = phoneNumber.replaceAll("[^+\\d]", "");
        
        // If it starts with +, keep it, otherwise remove any + in the middle
        if (cleaned.startsWith("+")) {
            cleaned = "+" + cleaned.substring(1).replaceAll("\\+", "");
        } else {
            cleaned = cleaned.replaceAll("\\+", "");
        }
        
        Log.d(TAG, "Cleaned phone number: " + phoneNumber + " -> " + cleaned);
        return cleaned;
    }
    
    /**
     * Validate if phone number format is acceptable
     */
    public boolean isValidPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return false;
        }
        
        String cleaned = cleanPhoneNumber(phoneNumber);
        
        // Basic validation: should have at least 10 digits
        String digitsOnly = cleaned.replaceAll("[^\\d]", "");
        return digitsOnly.length() >= 10;
    }
    
    /**
     * Format emergency message with proper length limits
     */
    public String formatEmergencyMessage(String userName, String location, CriticalUser user) {
        StringBuilder message = new StringBuilder();
        
        // Core message
        message.append("WRISTBUD EMERGENCY: Critical vitals detected for ");
        message.append(userName.toUpperCase());
        message.append(". Location: ").append(location);
        
        // Add vital signs if space allows
        if (user != null) {
            StringBuilder vitals = new StringBuilder();
            
            if (user.getHeartRate() > 0) {
                vitals.append(" HR:").append(user.getHeartRate());
            }
            if (user.getBloodPressure() != null && !user.getBloodPressure().isEmpty()) {
                vitals.append(" BP:").append(user.getBloodPressure());
            }
            if (user.getSpo2() > 0) {
                vitals.append(" O2:").append(user.getSpo2()).append("%");
            }
            if (user.getTemperature() > 0) {
                vitals.append(" T:").append(String.format("%.1f", user.getTemperature())).append("F");
            }
            
            // Only add vitals if total message length is reasonable
            if (message.length() + vitals.length() < 300) {
                message.append(vitals);
            }
        }
        
        message.append(". Please check immediately!");
        
        return message.toString();
    }
    
    /**
     * Send test SMS for verification
     */
    public boolean sendTestSMS(String phoneNumber) {
        String testMessage = "WRISTBUD TEST: Emergency monitoring system is active and working properly. This is a test message.";
        return sendSMS(phoneNumber, testMessage);
    }
}
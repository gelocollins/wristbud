package angelo.collins.smssender;


import android.annotation.SuppressLint;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class CriticalMonitorService extends Service {
    private static final String TAG = "CriticalMonitorService";
    private static final String CHANNEL_ID = "WristBudCriticalMonitor";
    private static final int NOTIFICATION_ID = 1001;
    private static final int CHECK_INTERVAL_MS = 1000; // Check every 1 second
    
    private static boolean isRunning = false;
    
    private Handler handler;
    private Runnable checkRunnable;
    private ExecutorService executorService;
    private DatabaseHelper dbHelper;
    private SMSManager smsManager;
    private LocationHelper locationHelper;
    
    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "Service created");
        
        dbHelper = new DatabaseHelper(this);
        smsManager = new SMSManager(this);
        locationHelper = new LocationHelper(this);
        executorService = Executors.newSingleThreadExecutor();
        handler = new Handler(Looper.getMainLooper());
        
        createNotificationChannel();
        setupCheckRunnable();
    }
    
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "Service started");
        isRunning = true;
        
        try {
            startForeground(NOTIFICATION_ID, createNotification());
            Log.d(TAG, "Service started in foreground successfully");
        } catch (Exception e) {
            Log.e(TAG, "Failed to start foreground service: " + e.getMessage());
            // Continue running as a background service
            // Note: This may be killed by the system more easily
        }
        
        startPeriodicCheck();
        
        return START_STICKY; // Restart service if killed
    }
    
    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "Service destroyed");
        isRunning = false;
        
        if (handler != null && checkRunnable != null) {
            handler.removeCallbacks(checkRunnable);
        }
        
        if (executorService != null) {
            executorService.shutdown();
        }
        
        if (dbHelper != null) {
            dbHelper.close();
        }
    }
    
    @Override
    public IBinder onBind(Intent intent) {
        return null; // Not a bound service
    }
    
    public static boolean isServiceRunning() {
        return isRunning;
    }
    
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "WristBud Critical Monitor",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Monitors for critical health alerts and sends emergency SMS");
            
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }
    }
    
    private Notification createNotification() {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE
        );
        
        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("WristBud Emergency Monitor")
            .setContentText("Monitoring for critical health alerts...")
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build();
    }
    
    private void setupCheckRunnable() {
        checkRunnable = new Runnable() {
            @Override
            public void run() {
                executorService.execute(() -> {
                    try {
                        checkForCriticalUsers();
                    } catch (Exception e) {
                        Log.e(TAG, "Error checking for critical users", e);
                    }
                });
                
                // Schedule next check
                handler.postDelayed(this, CHECK_INTERVAL_MS);
            }
        };
    }
    
    private void startPeriodicCheck() {
        handler.post(checkRunnable);
    }
    
    private void checkForCriticalUsers() {
        Log.d(TAG, "Checking for critical users...");
        try {
            List<CriticalUser> criticalUsers = dbHelper.getCriticalUsers();
            if (criticalUsers.isEmpty()) {
                Log.d(TAG, "No critical users found");
                MainActivity.appendServiceDebug("No critical users found");
                return;
            }
            // Log user IDs for debugging
            StringBuilder userIds = new StringBuilder();
            for (CriticalUser user : criticalUsers) {
                if (userIds.length() > 0) userIds.append(",");
                userIds.append(user.getUserId());
            }
            String logMsg = "Critical data found: " + criticalUsers.size() + " - time checked: " + new java.util.Date();
            String userListMsg = "Critical Users: [" + userIds + "]";
            Log.w(TAG, logMsg);
            Log.w(TAG, userListMsg);
            MainActivity.appendServiceDebug(logMsg);
            MainActivity.appendServiceDebug(userListMsg);
            for (CriticalUser user : criticalUsers) {
                processCriticalUser(user);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error checking critical users", e);
            MainActivity.appendServiceDebug("Error checking critical users: " + e.getMessage());
        }
    }

    private void processCriticalUser(CriticalUser user) {
        Log.w(TAG, "Processing critical user: " + user.getName() + " (ID: " + user.getUserId() + ")");
        MainActivity.appendServiceDebug("Processing critical user: " + user.getName() + " (ID: " + user.getUserId() + ")");
        // Only send for new alertId
        if (dbHelper.hasSMSBeenSent(user.getUserId(), user.getAlertId())) {
            Log.d(TAG, "SMS already sent for user " + user.getUserId() + " alert " + user.getAlertId());
            MainActivity.appendServiceDebug("SMS already sent for user " + user.getUserId() + " alert " + user.getAlertId());
            return;
        }
        String location = locationHelper.getLastKnownLocation();
        if (location == null || location.isEmpty()) {
            location = "Location unavailable";
        }
        String message = formatEmergencyMessage(user.getName(), location, user);
        int contactsSent = 0;
        // Emergency Contact 1
        if (user.getEmergencyPhone1() != null && !user.getEmergencyPhone1().isEmpty()) {
            boolean smsSent = smsManager.sendSMS(user.getEmergencyPhone1(), message);
            if (smsSent) {
                dbHelper.markSMSAsSent(user.getUserId(), user.getAlertId(), user.getEmergencyPhone1(), message);
                incrementSMSCount();
                Log.i(TAG, "Sent alert to user " + user.getUserId() + " / contact 1: " + user.getEmergencyPhone1());
                MainActivity.appendServiceDebug("Sent alert to user " + user.getUserId() + " / contact 1: " + user.getEmergencyPhone1());
                contactsSent++;
            } else {
                Log.e(TAG, "Failed to send SMS to contact 1 for user " + user.getUserId());
                MainActivity.appendServiceDebug("Failed to send SMS to contact 1 for user " + user.getUserId());
            }
        }
        // Emergency Contact 2
        if (user.getEmergencyPhone2() != null && !user.getEmergencyPhone2().isEmpty()) {
            boolean smsSent = smsManager.sendSMS(user.getEmergencyPhone2(), message);
            if (smsSent) {
                dbHelper.markSMSAsSent(user.getUserId(), user.getAlertId(), user.getEmergencyPhone2(), message);
                incrementSMSCount();
                Log.i(TAG, "Sent alert to user " + user.getUserId() + " / contact 2: " + user.getEmergencyPhone2());
                MainActivity.appendServiceDebug("Sent alert to user " + user.getUserId() + " / contact 2: " + user.getEmergencyPhone2());
                contactsSent++;
            } else {
                Log.e(TAG, "Failed to send SMS to contact 2 for user " + user.getUserId());
                MainActivity.appendServiceDebug("Failed to send SMS to contact 2 for user " + user.getUserId());
            }
        }
        // Emergency Contact 3 (optional)
        if (user.getEmergencyPhone3() != null && !user.getEmergencyPhone3().isEmpty()) {
            boolean smsSent = smsManager.sendSMS(user.getEmergencyPhone3(), message);
            if (smsSent) {
                dbHelper.markSMSAsSent(user.getUserId(), user.getAlertId(), user.getEmergencyPhone3(), message);
                incrementSMSCount();
                Log.i(TAG, "Sent alert to user " + user.getUserId() + " / contact 3: " + user.getEmergencyPhone3());
                MainActivity.appendServiceDebug("Sent alert to user " + user.getUserId() + " / contact 3: " + user.getEmergencyPhone3());
                contactsSent++;
            } else {
                Log.e(TAG, "Failed to send SMS to contact 3 for user " + user.getUserId());
                MainActivity.appendServiceDebug("Failed to send SMS to contact 3 for user " + user.getUserId());
            }
        }
        Log.w(TAG, "Sending alert to user " + user.getUserId() + " / registered contacts: " + contactsSent);
        MainActivity.appendServiceDebug("Sending alert to user " + user.getUserId() + " / registered contacts: " + contactsSent);
        updateNotification("Emergency SMS sent for " + user.getName() + " (" + contactsSent + " contacts)");
    }
    
    private String formatEmergencyMessage(String userName, String location, CriticalUser user) {
        StringBuilder message = new StringBuilder();
        message.append("THIS IS MESSAGE IS FROM WRISTBUD: ");
        message.append("WE WOULD LIKE TO INFORM YOU THAT WE HAVE DETECTED A CRITICAL VITALS FOR ");
        message.append(userName.toUpperCase());
        message.append(". LAST LOCATION SEEN IS ");
        message.append(location);
        message.append(".");
        
        // Add vital signs if available
        if (user.getHeartRate() > 0) {
            message.append(" HR: ").append(user.getHeartRate()).append(" BPM");
        }
        if (user.getBloodPressure() != null && !user.getBloodPressure().isEmpty()) {
            message.append(" BP: ").append(user.getBloodPressure());
        }
        if (user.getSpo2() > 0) {
            message.append(" SpO2: ").append(user.getSpo2()).append("%");
        }
        if (user.getTemperature() > 0) {
            message.append(" Temp: ").append(String.format("%.1f", user.getTemperature())).append("°F");
        }
        
        message.append(" Please check on them immediately.");
        
        return message.toString();
    }
    
    private void incrementSMSCount() {
        int currentCount = getSharedPreferences("WristBudSMS", MODE_PRIVATE).getInt("sms_sent_count", 0);
        getSharedPreferences("WristBudSMS", MODE_PRIVATE)
            .edit()
            .putInt("sms_sent_count", currentCount + 1)
            .apply();
    }
    
    private void updateNotification(String message) {
        NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("WristBud Emergency Monitor")
            .setContentText(message)
            .setOngoing(true)
            .build();
            
        manager.notify(NOTIFICATION_ID, notification);
    }
}
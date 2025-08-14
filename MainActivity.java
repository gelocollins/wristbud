package angelo.collins.smssender;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import android.app.AlertDialog;
import android.text.InputType;
import android.widget.EditText;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class MainActivity extends AppCompatActivity {
    private static final String TAG = "WristBudSMSSender";
    private static final int PERMISSION_REQUEST_CODE = 100;
    
    private Switch serviceSwitch;
    private TextView statusText;
    private TextView lastCheckText;
    private TextView sentCountText;
    private Button testButton;
    private Button configIpButton;
    
    private angelo.collins.smssender.DatabaseHelper dbHelper;
    private angelo.collins.smssender.SMSManager smsManager;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        initializeViews();
        initializeComponents();
        checkPermissions();
        updateUI();
    }
    
    private void initializeViews() {
        serviceSwitch = findViewById(R.id.serviceSwitch);
        statusText = findViewById(R.id.statusText);
        lastCheckText = findViewById(R.id.lastCheckText);
        sentCountText = findViewById(R.id.sentCountText);
        testButton = findViewById(R.id.testButton);
        // Add a button for configuring API IP
        configIpButton = findViewById(R.id.configIpButton);
        configIpButton.setOnClickListener(v -> showConfigIpDialog());
        
        serviceSwitch.setOnCheckedChangeListener((buttonView, isChecked) -> {
            if (isChecked) {
                startMonitoringService();
            } else {
                stopMonitoringService();
            }
            updateUI();
        });
        
        testButton.setOnClickListener(v -> testSMSFunctionality());
    }
    
    private void initializeComponents() {
        dbHelper = new DatabaseHelper(this);
        smsManager = new SMSManager(this);
    }
    
    private void checkPermissions() {
        String[] permissions = {
            Manifest.permission.SEND_SMS,
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION,
            Manifest.permission.INTERNET
        };
        
        boolean allPermissionsGranted = true;
        for (String permission : permissions) {
            if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                allPermissionsGranted = false;
                break;
            }
        }
        
        if (!allPermissionsGranted) {
            ActivityCompat.requestPermissions(this, permissions, PERMISSION_REQUEST_CODE);
        }
    }
    
    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        
        if (requestCode == PERMISSION_REQUEST_CODE) {
            boolean allGranted = true;
            for (int result : grantResults) {
                if (result != PackageManager.PERMISSION_GRANTED) {
                    allGranted = false;
                    break;
                }
            }
            
            if (allGranted) {
                Toast.makeText(this, "All permissions granted", Toast.LENGTH_SHORT).show();
                updateUI();
            } else {
                Toast.makeText(this, "Permissions required for SMS functionality", Toast.LENGTH_LONG).show();
            }
        }
    }
    
    private void startMonitoringService() {
        if (hasRequiredPermissions()) {
            Intent serviceIntent = new Intent(this, CriticalMonitorService.class);
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    startForegroundService(serviceIntent);
                } else {
                    startService(serviceIntent);
                }

                statusText.setText("Service Status: ACTIVE");
                statusText.setTextColor(getResources().getColor(android.R.color.holo_green_dark));
                
                Toast.makeText(this, "Critical monitoring service started", Toast.LENGTH_SHORT).show();
                Log.i(TAG, "Critical monitoring service started");
            } catch (Exception e) {
                Log.e(TAG, "Failed to start service", e);
                serviceSwitch.setChecked(false);
                Toast.makeText(this, "Failed to start service: " + e.getMessage(), Toast.LENGTH_LONG).show();
            }
        } else {
            serviceSwitch.setChecked(false);
            Toast.makeText(this, "Required permissions not granted", Toast.LENGTH_LONG).show();
        }
    }
    
    private void stopMonitoringService() {
        Intent serviceIntent = new Intent(this, CriticalMonitorService.class);
        stopService(serviceIntent);
        
        statusText.setText("Service Status: STOPPED");
        statusText.setTextColor(getResources().getColor(android.R.color.holo_red_dark));
        
        Toast.makeText(this, "Critical monitoring service stopped", Toast.LENGTH_SHORT).show();
        Log.i(TAG, "Critical monitoring service stopped");
    }
    
    private void updateUI() {
        // Update last check time
        String currentTime = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(new Date());
        lastCheckText.setText("Last Check: " + currentTime);
        
        // Update sent count from preferences
        int sentCount = getSharedPreferences("WristBudSMS", MODE_PRIVATE).getInt("sms_sent_count", 0);
        sentCountText.setText("SMS Sent Today: " + sentCount);
        
        // Update service status
        boolean isServiceRunning = CriticalMonitorService.isServiceRunning();
        serviceSwitch.setChecked(isServiceRunning);
        
        if (isServiceRunning) {
            statusText.setText("Service Status: ACTIVE");
            statusText.setTextColor(getResources().getColor(android.R.color.holo_green_dark));
        } else {
            statusText.setText("Service Status: STOPPED");
            statusText.setTextColor(getResources().getColor(android.R.color.holo_red_dark));
        }
    }
    
    private void testSMSFunctionality() {
        if (!hasRequiredPermissions()) {
            Toast.makeText(this, "SMS permission required for testing", Toast.LENGTH_LONG).show();
            return;
        }
        String testMessage = "THIS IS MESSAGE IS FROM WRISTBUD: TEST MESSAGE - Emergency monitoring system is working properly.";
        String testPhoneNumber = "+09312123340"; 
        boolean success = smsManager.sendSMS(testPhoneNumber, testMessage);
        if (success) {
            Toast.makeText(this, "Test SMS sent successfully", Toast.LENGTH_SHORT).show();
            Log.i(TAG, "Test SMS sent to: " + testPhoneNumber);
        } else {
            Toast.makeText(this, "Failed to send test SMS", Toast.LENGTH_SHORT).show();
            Log.e(TAG, "Failed to send test SMS");
        }
    }
    
    private void showConfigIpDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Set API Base URL (IP)");
        final EditText input = new EditText(this);
        input.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_URI);
        // Load current value
        SharedPreferences prefs = PreferenceManager.getDefaultSharedPreferences(this);
        String currentUrl = prefs.getString("api_base_url", "");
        input.setText(currentUrl);
        builder.setView(input);
        builder.setPositiveButton("Save", (dialog, which) -> {
            String newUrl = input.getText().toString().trim();
            prefs.edit().putString("api_base_url", newUrl).apply();
            Toast.makeText(this, "API Base URL saved! Restart app to apply.", Toast.LENGTH_LONG).show();
        });
        builder.setNegativeButton("Cancel", (dialog, which) -> dialog.cancel());
        builder.show();
    }
    
    private boolean hasRequiredPermissions() {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.SEND_SMS) == PackageManager.PERMISSION_GRANTED &&
               ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        updateUI();
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (dbHelper != null) {
            dbHelper.close();
        }
    }
}
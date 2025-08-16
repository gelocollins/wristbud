package angelo.collins.smssender;


import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class BootReceiver extends BroadcastReceiver {
    private static final String TAG = "BootReceiver";
    
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        Log.d(TAG, "Received broadcast: " + action);
        
        if (Intent.ACTION_BOOT_COMPLETED.equals(action) ||
            Intent.ACTION_MY_PACKAGE_REPLACED.equals(action) ||
            Intent.ACTION_PACKAGE_REPLACED.equals(action)) {
            
            Log.i(TAG, "Device booted or app updated, starting WristBud SMS monitoring service");
            
            // Start the critical monitoring service
            Intent serviceIntent = new Intent(context, CriticalMonitorService.class);
            context.startForegroundService(serviceIntent);
            
            Log.i(TAG, "WristBud SMS monitoring service started automatically");
        }
    }
}
package angelo.collins.smssender;


import android.content.Context;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class APIClient {
    private static final String TAG = "APIClient";
    private String baseUrl;
    private static final int TIMEOUT_SECONDS = 30;
    
    private OkHttpClient client;
    private Context context;
    
    /**
     * Create APIClient with configurable base URL
     */
    public APIClient(Context context, String baseUrl) {
        this.context = context;
        this.baseUrl = baseUrl;
        this.client = new OkHttpClient.Builder()
            .connectTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .readTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .writeTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .build();
    }
    
    /**
     * Optionally allow changing base URL at runtime
     */
    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }
    public String getBaseUrl() {
        return this.baseUrl;
    }
    
    /**
     * Fetch all users with critical health status from the server
     */
    public List<CriticalUser> getCriticalUsers() {
        List<CriticalUser> criticalUsers = new ArrayList<>();
        
        try {
            String url = baseUrl + "/api/critical-users";
            
            Request request = new Request.Builder()
                .url(url)
                .get()
                .build();
            
            Response response = client.newCall(request).execute();
            
            if (response.isSuccessful() && response.body() != null) {
                String responseBody = response.body().string();
                Log.d(TAG, "Server response: " + responseBody);
                
                JSONObject jsonResponse = new JSONObject(responseBody);
                JSONArray usersArray = jsonResponse.getJSONArray("users");
                
                for (int i = 0; i < usersArray.length(); i++) {
                    JSONObject userJson = usersArray.getJSONObject(i);
                    
                    CriticalUser user = new CriticalUser();
                    user.setUserId(userJson.getInt("user_id"));
                    user.setName(userJson.getString("name"));
                    user.setEmail(userJson.getString("email"));
                    user.setEmergencyContact(userJson.optString("emergency_contact", null));
                    user.setEmergencyPhone(userJson.optString("emergency_phone", null));
                    user.setAlertId(userJson.getInt("alert_id"));
                    user.setHeartRate(userJson.optInt("heart_rate", 0));
                    user.setBloodPressure(userJson.optString("blood_pressure", null));
                    user.setSpo2(userJson.optInt("spo2", 0));
                    user.setTemperature(userJson.optDouble("temperature", 0.0));
                    user.setAlertMessage(userJson.optString("alert_message", ""));
                    user.setCreatedAt(userJson.optString("created_at", ""));
                    
                    criticalUsers.add(user);
                }
                
                Log.d(TAG, "Successfully parsed " + criticalUsers.size() + " critical users");
                
            } else {
                Log.e(TAG, "Server request failed with code: " + response.code());
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error fetching critical users", e);
        }
        
        return criticalUsers;
    }
    
    /**
     * Test server connection
     */
    public boolean testConnection() {
        try {
            String url = baseUrl + "/health";
            
            Request request = new Request.Builder()
                .url(url)
                .get()
                .build();
            
            Response response = client.newCall(request).execute();
            
            if (response.isSuccessful()) {
                Log.d(TAG, "Server connection test successful");
                return true;
            } else {
                Log.e(TAG, "Server connection test failed with code: " + response.code());
                return false;
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Server connection test failed", e);
            return false;
        }
    }
    
    /**
     * Report SMS sent status back to server
     */
    public void reportSMSSent(int userId, int alertId, String phoneNumber, boolean success) {
        try {
            String url = baseUrl + "/api/sms-status";
            
            JSONObject jsonBody = new JSONObject();
            jsonBody.put("user_id", userId);
            jsonBody.put("alert_id", alertId);
            jsonBody.put("phone_number", phoneNumber);
            jsonBody.put("status", success ? "sent" : "failed");
            jsonBody.put("timestamp", System.currentTimeMillis());
            
            okhttp3.RequestBody requestBody = okhttp3.RequestBody.create(
                jsonBody.toString(),
                okhttp3.MediaType.parse("application/json")
            );
            
            Request request = new Request.Builder()
                .url(url)
                .post(requestBody)
                .build();
            
            Response response = client.newCall(request).execute();
            
            if (response.isSuccessful()) {
                Log.d(TAG, "SMS status reported successfully");
            } else {
                Log.e(TAG, "Failed to report SMS status: " + response.code());
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error reporting SMS status", e);
        }
    }
}
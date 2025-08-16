package angelo.collins.smssender;


import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;

import java.util.ArrayList;
import java.util.List;
public class DatabaseHelper extends SQLiteOpenHelper {
    private static final String TAG = "DatabaseHelper";
    private static final String DATABASE_NAME = "wristbud_sms.db";
    private static final int DATABASE_VERSION = 1;

    private static final String TABLE_SMS_LOG = "sms_log";
    private static final String COLUMN_ID = "id";
    private static final String COLUMN_USER_ID = "user_id";
    private static final String COLUMN_ALERT_ID = "alert_id";
    private static final String COLUMN_PHONE_NUMBER = "phone_number";
    private static final String COLUMN_MESSAGE = "message";
    private static final String COLUMN_SENT_AT = "sent_at";
    private static final String COLUMN_STATUS = "status";

    private APIClient apiClient;

    public DatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
        SharedPreferences prefs = PreferenceManager.getDefaultSharedPreferences(context);
        String baseUrl = prefs.getString("api_base_url", null);
        if (baseUrl == null || baseUrl.isEmpty()) {
            baseUrl = "http://192.168.1.100:5000";
        }
        apiClient = new APIClient(context, baseUrl);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        String createSMSLogTable = "CREATE TABLE " + TABLE_SMS_LOG + " (" +
                COLUMN_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                COLUMN_USER_ID + " INTEGER NOT NULL, " +
                COLUMN_ALERT_ID + " INTEGER NOT NULL, " +
                COLUMN_PHONE_NUMBER + " TEXT NOT NULL, " +
                COLUMN_MESSAGE + " TEXT NOT NULL, " +
                COLUMN_SENT_AT + " DATETIME DEFAULT CURRENT_TIMESTAMP, " +
                COLUMN_STATUS + " TEXT DEFAULT 'sent'" +
                ")";

        db.execSQL(createSMSLogTable);
        Log.d(TAG, "SMS log table created");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_SMS_LOG);
        onCreate(db);
    }

    /**
     * Get all users with critical status from the server
     */
    public List<CriticalUser> getCriticalUsers() {
        List<CriticalUser> criticalUsers = new ArrayList<>();

        try {
            // Fetch critical users from the server API
            criticalUsers = apiClient.getCriticalUsers();
            Log.d(TAG, "Fetched " + criticalUsers.size() + " critical users from server");

        } catch (Exception e) {
            Log.e(TAG, "Error fetching critical users from server", e);
        }

        return criticalUsers;
    }

    /**
     * Check if SMS has already been sent for this user and alert
     */
    public boolean hasSMSBeenSent(int userId, int alertId) {
        SQLiteDatabase db = this.getReadableDatabase();

        String query = "SELECT COUNT(*) FROM " + TABLE_SMS_LOG +
                " WHERE " + COLUMN_USER_ID + " = ? AND " + COLUMN_ALERT_ID + " = ?";

        Cursor cursor = db.rawQuery(query, new String[]{String.valueOf(userId), String.valueOf(alertId)});

        boolean hasSent = false;
        if (cursor.moveToFirst()) {
            hasSent = cursor.getInt(0) > 0;
        }

        cursor.close();
        return hasSent;
    }

    /**
     * Mark SMS as sent in the local database
     */
    public void markSMSAsSent(int userId, int alertId, String phoneNumber, String message) {
        SQLiteDatabase db = this.getWritableDatabase();

        ContentValues values = new ContentValues();
        values.put(COLUMN_USER_ID, userId);
        values.put(COLUMN_ALERT_ID, alertId);
        values.put(COLUMN_PHONE_NUMBER, phoneNumber);
        values.put(COLUMN_MESSAGE, message);
        values.put(COLUMN_STATUS, "sent");

        long result = db.insert(TABLE_SMS_LOG, null, values);

        if (result != -1) {
            Log.d(TAG, "SMS marked as sent for user " + userId + " alert " + alertId);
        } else {
            Log.e(TAG, "Failed to mark SMS as sent");
        }
    }

    /**
     * Get SMS log for debugging/monitoring
     */
    public List<SMSLogEntry> getSMSLog(int limit) {
        List<SMSLogEntry> logEntries = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();

        String query = "SELECT * FROM " + TABLE_SMS_LOG +
                " ORDER BY " + COLUMN_SENT_AT + " DESC LIMIT ?";

        Cursor cursor = db.rawQuery(query, new String[]{String.valueOf(limit)});

        while (cursor.moveToNext()) {
            SMSLogEntry entry = new SMSLogEntry();
            entry.setId(cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ID)));
            entry.setUserId(cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_USER_ID)));
            entry.setAlertId(cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_ALERT_ID)));
            entry.setPhoneNumber(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_PHONE_NUMBER)));
            entry.setMessage(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_MESSAGE)));
            entry.setSentAt(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_SENT_AT)));
            entry.setStatus(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_STATUS)));

            logEntries.add(entry);
        }

        cursor.close();
        return logEntries;
    }

    /**
     * Clean up old SMS log entries (keep only last 1000)
     */
    public void cleanupOldSMSLogs() {
        SQLiteDatabase db = this.getWritableDatabase();

        String deleteQuery = "DELETE FROM " + TABLE_SMS_LOG +
                " WHERE " + COLUMN_ID + " NOT IN (" +
                "SELECT " + COLUMN_ID + " FROM " + TABLE_SMS_LOG +
                " ORDER BY " + COLUMN_SENT_AT + " DESC LIMIT 1000)";

        int deletedRows = db.delete(TABLE_SMS_LOG,
                COLUMN_ID + " NOT IN (SELECT " + COLUMN_ID + " FROM " + TABLE_SMS_LOG +
                        " ORDER BY " + COLUMN_SENT_AT + " DESC LIMIT 1000)", null);

        Log.d(TAG, "Cleaned up " + deletedRows + " old SMS log entries");
    }

    /**
     * Get total SMS sent count for today
     */
    public int getTodaySMSCount() {
        SQLiteDatabase db = this.getReadableDatabase();

        String query = "SELECT COUNT(*) FROM " + TABLE_SMS_LOG +
                " WHERE DATE(" + COLUMN_SENT_AT + ") = DATE('now')";

        Cursor cursor = db.rawQuery(query, null);

        int count = 0;
        if (cursor.moveToFirst()) {
            count = cursor.getInt(0);
        }

        cursor.close();
        return count;
    }
}
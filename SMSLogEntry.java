package angelo.collins.smssender;

public class SMSLogEntry {
    private int id;
    private int userId;
    private int alertId;
    private String phoneNumber;
    private String message;
    private String sentAt;
    private String status;

    // Constructors
    public SMSLogEntry() {}

    public SMSLogEntry(int userId, int alertId, String phoneNumber, String message, String status) {
        this.userId = userId;
        this.alertId = alertId;
        this.phoneNumber = phoneNumber;
        this.message = message;
        this.status = status;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public int getAlertId() {
        return alertId;
    }

    public void setAlertId(int alertId) {
        this.alertId = alertId;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSentAt() {
        return sentAt;
    }

    public void setSentAt(String sentAt) {
        this.sentAt = sentAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "SMSLogEntry{" +
                "id=" + id +
                ", userId=" + userId +
                ", alertId=" + alertId +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", message='" + message + '\'' +
                ", sentAt='" + sentAt + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
}
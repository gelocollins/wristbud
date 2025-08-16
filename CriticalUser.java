package angelo.collins.smssender;


public class CriticalUser {
    private int userId;
    private String name;
    private String email;
    private String emergencyContact;
    private String emergencyPhone;
    private int alertId;
    private int heartRate;
    private String bloodPressure;
    private int spo2;
    private double temperature;
    private String alertMessage;
    private String createdAt;
    private String emergencyContact1;
    private String emergencyPhone1;
    private String emergencyContact2;
    private String emergencyPhone2;
    private String emergencyContact3;
    private String emergencyPhone3;
    
    // Constructors
    public CriticalUser() {}
    
    public CriticalUser(int userId, String name, String email, String emergencyContact, 
                       String emergencyPhone, int alertId) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.emergencyContact = emergencyContact;
        this.emergencyPhone = emergencyPhone;
        this.alertId = alertId;
    }
    
    public int getUserId() {
        return userId;
    }
    
    public void setUserId(int userId) {
        this.userId = userId;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getEmergencyContact() {
        return emergencyContact;
    }
    
    public void setEmergencyContact(String emergencyContact) {
        this.emergencyContact = emergencyContact;
    }
    
    public String getEmergencyPhone() {
        return emergencyPhone;
    }
    
    public void setEmergencyPhone(String emergencyPhone) {
        this.emergencyPhone = emergencyPhone;
    }
    
    public int getAlertId() {
        return alertId;
    }
    
    public void setAlertId(int alertId) {
        this.alertId = alertId;
    }
    
    public int getHeartRate() {
        return heartRate;
    }
    
    public void setHeartRate(int heartRate) {
        this.heartRate = heartRate;
    }
    
    public String getBloodPressure() {
        return bloodPressure;
    }
    
    public void setBloodPressure(String bloodPressure) {
        this.bloodPressure = bloodPressure;
    }
    
    public int getSpo2() {
        return spo2;
    }
    
    public void setSpo2(int spo2) {
        this.spo2 = spo2;
    }
    
    public double getTemperature() {
        return temperature;
    }
    
    public void setTemperature(double temperature) {
        this.temperature = temperature;
    }
    
    public String getAlertMessage() {
        return alertMessage;
    }
    
    public void setAlertMessage(String alertMessage) {
        this.alertMessage = alertMessage;
    }
    
    public String getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getEmergencyContact1() {
        return emergencyContact1;
    }
    
    public void setEmergencyContact1(String emergencyContact1) {
        this.emergencyContact1 = emergencyContact1;
    }
    
    public String getEmergencyPhone1() {
        return emergencyPhone1;
    }
    
    public void setEmergencyPhone1(String emergencyPhone1) {
        this.emergencyPhone1 = emergencyPhone1;
    }
    
    public String getEmergencyContact2() {
        return emergencyContact2;
    }
    
    public void setEmergencyContact2(String emergencyContact2) {
        this.emergencyContact2 = emergencyContact2;
    }
    
    public String getEmergencyPhone2() {
        return emergencyPhone2;
    }
    
    public void setEmergencyPhone2(String emergencyPhone2) {
        this.emergencyPhone2 = emergencyPhone2;
    }
    
    public String getEmergencyContact3() {
        return emergencyContact3;
    }
    
    public void setEmergencyContact3(String emergencyContact3) {
        this.emergencyContact3 = emergencyContact3;
    }
    
    public String getEmergencyPhone3() {
        return emergencyPhone3;
    }
    
    public void setEmergencyPhone3(String emergencyPhone3) {
        this.emergencyPhone3 = emergencyPhone3;
    }
    
    @Override
    public String toString() {
        return "CriticalUser{" +
                "userId=" + userId +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", emergencyContact1='" + emergencyContact1 + '\'' +
                ", emergencyPhone1='" + emergencyPhone1 + '\'' +
                ", emergencyContact2='" + emergencyContact2 + '\'' +
                ", emergencyPhone2='" + emergencyPhone2 + '\'' +
                ", emergencyContact3='" + emergencyContact3 + '\'' +
                ", emergencyPhone3='" + emergencyPhone3 + '\'' +
                ", alertId=" + alertId +
                ", heartRate=" + heartRate +
                ", bloodPressure='" + bloodPressure + '\'' +
                ", spo2=" + spo2 +
                ", temperature=" + temperature +
                ", alertMessage='" + alertMessage + '\'' +
                ", createdAt='" + createdAt + '\'' +
                '}';
    }
}
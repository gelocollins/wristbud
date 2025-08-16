package angelo.collins.smssender;


import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.location.LocationManager;
import android.util.Log;

import androidx.core.app.ActivityCompat;

import java.util.List;
import java.util.Locale;

public class LocationHelper {
    private static final String TAG = "LocationHelper";
    
    private Context context;
    private LocationManager locationManager;
    private Geocoder geocoder;
    
    public LocationHelper(Context context) {
        this.context = context;
        this.locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
        this.geocoder = new Geocoder(context, Locale.getDefault());
    }
    
    /**
     * Get the last known location as a formatted string
     */
    public String getLastKnownLocation() {
        try {
            // Check for location permissions
            if (ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED &&
                ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                Log.w(TAG, "Location permissions not granted");
                return "Location permission not granted";
            }
            
            Location location = null;
            
            // Try to get location from GPS first
            if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                location = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
                Log.d(TAG, "GPS location: " + (location != null ? "available" : "null"));
            }
            
            // If GPS location is not available, try network location
            if (location == null && locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                location = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
                Log.d(TAG, "Network location: " + (location != null ? "available" : "null"));
            }
            
            // If still no location, try passive provider
            if (location == null && locationManager.isProviderEnabled(LocationManager.PASSIVE_PROVIDER)) {
                location = locationManager.getLastKnownLocation(LocationManager.PASSIVE_PROVIDER);
                Log.d(TAG, "Passive location: " + (location != null ? "available" : "null"));
            }
            
            if (location != null) {
                return formatLocation(location);
            } else {
                Log.w(TAG, "No location available from any provider");
                return "Location unavailable";
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error getting location", e);
            return "Location error";
        }
    }
    
    /**
     * Format location into a readable string
     */
    private String formatLocation(Location location) {
        try {
            double latitude = location.getLatitude();
            double longitude = location.getLongitude();
            
            Log.d(TAG, "Location coordinates: " + latitude + ", " + longitude);
            
            // Try to get address from coordinates
            if (Geocoder.isPresent()) {
                try {
                    List<Address> addresses = geocoder.getFromLocation(latitude, longitude, 1);
                    
                    if (addresses != null && !addresses.isEmpty()) {
                        Address address = addresses.get(0);
                        
                        StringBuilder locationString = new StringBuilder();
                        
                        // Add street address if available
                        if (address.getAddressLine(0) != null) {
                            locationString.append(address.getAddressLine(0));
                        } else {
                            // Build address from components
                            if (address.getSubThoroughfare() != null) {
                                locationString.append(address.getSubThoroughfare()).append(" ");
                            }
                            if (address.getThoroughfare() != null) {
                                locationString.append(address.getThoroughfare());
                            }
                        }
                        
                        // Add city and state
                        if (address.getLocality() != null) {
                            if (locationString.length() > 0) locationString.append(", ");
                            locationString.append(address.getLocality());
                        }
                        
                        if (address.getAdminArea() != null) {
                            if (locationString.length() > 0) locationString.append(", ");
                            locationString.append(address.getAdminArea());
                        }
                        
                        String formattedAddress = locationString.toString();
                        if (!formattedAddress.isEmpty()) {
                            Log.d(TAG, "Formatted address: " + formattedAddress);
                            return formattedAddress;
                        }
                    }
                } catch (Exception e) {
                    Log.w(TAG, "Geocoding failed, using coordinates", e);
                }
            }
            
            // Fallback to coordinates if geocoding fails
            String coordinates = String.format(Locale.US, "%.6f, %.6f", latitude, longitude);
            Log.d(TAG, "Using coordinates: " + coordinates);
            return coordinates;
            
        } catch (Exception e) {
            Log.e(TAG, "Error formatting location", e);
            return "Location format error";
        }
    }
    
    /**
     * Check if location services are enabled
     */
    public boolean isLocationEnabled() {
        try {
            return locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER) ||
                   locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER);
        } catch (Exception e) {
            Log.e(TAG, "Error checking location services", e);
            return false;
        }
    }
    
    /**
     * Get a simple location description for emergency messages
     */
    public String getSimpleLocation() {
        String fullLocation = getLastKnownLocation();
        
        // If location is too long, truncate it for SMS
        if (fullLocation.length() > 50) {
            // Try to keep the most important part (usually the first part)
            String[] parts = fullLocation.split(",");
            if (parts.length > 0) {
                return parts[0].trim();
            }
        }
        
        return fullLocation;
    }
}
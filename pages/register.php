<?php
require_once '../config/database.php';

$message = '';
$error = '';

function is_valid_ph_phone($phone) {
    $phone = preg_replace('/[\s\-\(\)]/', '', $phone);
    return preg_match('/^(\+63|0)?9\d{9}$/', $phone);
}

if ($_POST) {
    $database = new Database();
    $db = $database->getConnection();

    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    $emergency_contact1 = trim($_POST['emergency_contact1'] ?? '');
    $emergency_phone1 = trim($_POST['emergency_phone1'] ?? '');
    $emergency_contact2 = trim($_POST['emergency_contact2'] ?? '');
    $emergency_phone2 = trim($_POST['emergency_phone2'] ?? '');
    $emergency_contact3 = trim($_POST['emergency_contact3'] ?? '');
    $emergency_phone3 = trim($_POST['emergency_phone3'] ?? '');

    // Validation
    if (
        empty($name) || empty($email) || empty($password) || empty($confirm_password) ||
        empty($emergency_contact1) || empty($emergency_phone1) ||
        empty($emergency_contact2) || empty($emergency_phone2)
    ) {
        $error = "All required fields must be filled. (2 emergency contacts required)";
    } elseif ($password !== $confirm_password) {
        $error = "Passwords do not match.";
    } elseif (strlen($password) < 6) {
        $error = "Password must be at least 6 characters long.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "Invalid email format.";
    } elseif (!is_valid_ph_phone($emergency_phone1) || !is_valid_ph_phone($emergency_phone2)) {
        $error = "Please enter valid Philippine mobile numbers for the first two emergency contacts.";
    } elseif ($emergency_phone3 && !is_valid_ph_phone($emergency_phone3)) {
        $error = "Please enter a valid Philippine mobile number for the third emergency contact.";
    } else {
        // Check if email already exists
        $query = "SELECT id FROM users WHERE email = :email";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $error = "Email already registered.";
        } else {
            // Insert new user - update to match new schema
            $query = "INSERT INTO users 
                (name, email, password, emergency_contact1, emergency_phone1, emergency_contact2, emergency_phone2, emergency_contact3, emergency_phone3) 
                VALUES 
                (:name, :email, :password, :emergency_contact1, :emergency_phone1, :emergency_contact2, :emergency_phone2, :emergency_contact3, :emergency_phone3)";
            $stmt = $db->prepare($query);

            $hashed_password = password_hash($password, PASSWORD_DEFAULT);

            $stmt->bindParam(":name", $name);
            $stmt->bindParam(":email", $email);
            $stmt->bindParam(":password", $hashed_password);
            $stmt->bindParam(":emergency_contact1", $emergency_contact1);
            $stmt->bindParam(":emergency_phone1", $emergency_phone1);
            $stmt->bindParam(":emergency_contact2", $emergency_contact2);
            $stmt->bindParam(":emergency_phone2", $emergency_phone2);
            $stmt->bindParam(":emergency_contact3", $emergency_contact3);
            $stmt->bindParam(":emergency_phone3", $emergency_phone3);

            if ($stmt->execute()) {
                $message = "Registration successful! You can now login to your WristBud app.";
            } else {
                $error = "Registration failed. Please try again.";
            }
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WristBud Registration</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 500px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #0BAF5A;
            text-align: center;
            margin-bottom: 30px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #333;
        }
        input[type="text"], input[type="email"], input[type="password"], input[type="tel"] {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            box-sizing: border-box;
        }
        input[type="submit"] {
            width: 100%;
            padding: 12px;
            background-color: #0BAF5A;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
        }
        input[type="submit"]:hover {
            background-color: #098a47;
        }
        .message {
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        .success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .emergency-section {
            background-color: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .emergency-section h3 {
            margin-top: 0;
            color: #856404;
        }
        .info-section {
            background-color: #e7f3ff;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            border-left: 4px solid #0BAF5A;
        }
        .info-section h3 {
            margin-top: 0;
            color: #0BAF5A;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>WristBud Registration</h1>
        <div class="info-section">
            <h3>Server Information</h3>
            <p><strong>Express Server:</strong> http://localhost:5000</p>
            <p><strong>API Endpoint:</strong> http://localhost:5000/api/</p>
            <p>Your WristBud app connects to the Express server for real-time health monitoring.</p>
        </div>
        <?php if ($message): ?>
            <div class="message success"><?php echo $message; ?></div>
        <?php endif; ?>
        <?php if ($error): ?>
            <div class="message error"><?php echo $error; ?></div>
        <?php endif; ?>
        <form method="POST">
            <div class="form-group">
                <label for="name">Full Name:</label>
                <input type="text" id="name" name="name" required value="<?php echo isset($_POST['name']) ? htmlspecialchars($_POST['name']) : ''; ?>">
            </div>
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>">
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required minlength="6">
            </div>
            <div class="form-group">
                <label for="confirm_password">Confirm Password:</label>
                <input type="password" id="confirm_password" name="confirm_password" required minlength="6">
            </div>
            <div class="emergency-section">
                <h3>Emergency Contact Information</h3>
                <p>2 contacts required, 3rd is optional</p>
                <div class="form-group">
                    <label for="emergency_contact1">Emergency Contact 1 Name *</label>
                    <input type="text" id="emergency_contact1" name="emergency_contact1" required value="<?php echo isset($_POST['emergency_contact1']) ? htmlspecialchars($_POST['emergency_contact1']) : ''; ?>">
                </div>
                <div class="form-group">
                    <label for="emergency_phone1">Emergency Contact 1 Phone *</label>
                    <input type="tel" id="emergency_phone1" name="emergency_phone1" required value="<?php echo isset($_POST['emergency_phone1']) ? htmlspecialchars($_POST['emergency_phone1']) : ''; ?>">
                </div>
                <div class="form-group">
                    <label for="emergency_contact2">Emergency Contact 2 Name *</label>
                    <input type="text" id="emergency_contact2" name="emergency_contact2" required value="<?php echo isset($_POST['emergency_contact2']) ? htmlspecialchars($_POST['emergency_contact2']) : ''; ?>">
                </div>
                <div class="form-group">
                    <label for="emergency_phone2">Emergency Contact 2 Phone *</label>
                    <input type="tel" id="emergency_phone2" name="emergency_phone2" required value="<?php echo isset($_POST['emergency_phone2']) ? htmlspecialchars($_POST['emergency_phone2']) : ''; ?>">
                </div>
                <div class="form-group">
                    <label for="emergency_contact3">Emergency Contact 3 Name (Optional)</label>
                    <input type="text" id="emergency_contact3" name="emergency_contact3" value="<?php echo isset($_POST['emergency_contact3']) ? htmlspecialchars($_POST['emergency_contact3']) : ''; ?>">
                </div>
                <div class="form-group">
                    <label for="emergency_phone3">Emergency Contact 3 Phone (Optional)</label>
                    <input type="tel" id="emergency_phone3" name="emergency_phone3" value="<?php echo isset($_POST['emergency_phone3']) ? htmlspecialchars($_POST['emergency_phone3']) : ''; ?>">
                </div>
            </div>
            <input type="submit" value="Register">
        </form>
        <p style="text-align: center; margin-top: 20px; color: #666;">
            After registration, login using your WristBud smartwatch app.<br>
            <small>App connects to Express server at localhost:5000</small>
        </p>
    </div>
</body>
</html>

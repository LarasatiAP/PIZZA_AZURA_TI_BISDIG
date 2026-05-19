<?php
// filepath: c:\Users\HYPE AMD\Documents\Allifyan\imk\imk2026\PIZZA_AZURA_TI_BISDIG\admin_login.php
session_start();

if (!isset($_SESSION['general_logged_in']) || $_SESSION['general_logged_in'] !== true) {
    header("Location: login.html"); // Redirect to general login page if not logged in
    exit();
}

// ...existing code...
$admin_username = "admin";
$admin_password = "admin000";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];

    if ($username === $admin_username && $password === $admin_password) {
        $_SESSION['admin_logged_in'] = true;
        header("Location: admin_dashboard.php"); // Redirect to admin dashboard
        exit();
    } else {
        echo "<script>alert('Invalid credentials!'); window.location.href = 'admin_login.html';</script>";
    }
} else {
    header("Location: admin_login.html");
    exit();
}
?>
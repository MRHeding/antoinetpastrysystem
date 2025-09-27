<?php
// Admin panel redirect - redirect to login if not authenticated
require_once 'auth-check.php';

$user = checkAdminAuth();

if ($user) {
    // User is authenticated as admin, redirect to admin dashboard
    header('Location: index.html');
    exit();
} else {
    // User is not authenticated, redirect to login
    header('Location: login.html');
    exit();
}
?>

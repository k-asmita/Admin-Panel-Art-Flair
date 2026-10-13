<?php
/**
 * Art Flair - PHPMailer Order Confirmation Service
 * Developed for Sabahz Trading
 * 
 * Fetches order details, registered user credentials, items, and inventory stock
 * directly from the MySQL database (art_flair) and sends an authoritative receipt
 * via PHPMailer.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

// Include PHPMailer classes
require_once __DIR__ . '/phpmailer/Exception.php';
require_once __DIR__ . '/phpmailer/PHPMailer.php';
require_once __DIR__ . '/phpmailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Helper to parse .env file
function loadEnv(string $path): array {
    $vars = [];
    if (!file_exists($path)) {
        return $vars;
    }
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        if (str_contains($line, '=')) {
            [$key, $val] = explode('=', $line, 2);
            $key = trim($key);
            $val = trim($val);
            $val = trim($val, "\"'");
            $vars[$key] = $val;
            putenv("$key=$val");
            $_ENV[$key] = $val;
        }
    }
    return $vars;
}

// Load environment variables from .env or backend/.env
$envPath = __DIR__ . '/.env';
if (!file_exists($envPath)) {
    $envPath = __DIR__ . '/backend/.env';
}
$env = loadEnv($envPath);

// Extract Order ID and optional Status from CLI argument, GET, POST, or JSON body
$orderId = null;
$statusArg = null;

if (isset($argv[1]) && !empty($argv[1])) {
    $orderId = trim($argv[1]);
    if (isset($argv[2]) && !empty($argv[2])) {
        $statusArg = trim($argv[2]);
    }
} elseif (isset($_GET['order_id']) && !empty($_GET['order_id'])) {
    $orderId = trim((string)$_GET['order_id']);
    $statusArg = isset($_GET['status']) ? trim((string)$_GET['status']) : null;
} elseif (isset($_POST['order_id']) && !empty($_POST['order_id'])) {
    $orderId = trim((string)$_POST['order_id']);
    $statusArg = isset($_POST['status']) ? trim((string)$_POST['status']) : null;
} else {
    $input = file_get_contents('php://input');
    if ($input) {
        $json = json_decode($input, true);
        if (isset($json['order_id'])) {
            $orderId = trim((string)$json['order_id']);
        } elseif (isset($json['orderId'])) {
            $orderId = trim((string)$json['orderId']);
        }
        if (isset($json['status'])) {
            $statusArg = trim((string)$json['status']);
        }
    }
}

if (!$orderId) {
    echo json_encode([
        'success' => false,
        'error' => 'Order ID is required. Pass via CLI ($argv[1]) or parameter ?order_id=ORD...'
    ], JSON_PRETTY_PRINT);
    exit(1);
}

// Database Connection Settings
$dbHost = getenv('DB_HOST') ?: ($env['DB_HOST'] ?? 'localhost');
$dbPort = getenv('DB_PORT') ?: ($env['DB_PORT'] ?? '3306');
$dbUser = getenv('DB_USER') ?: ($env['DB_USER'] ?? 'root');
$dbPass = getenv('DB_PASSWORD') ?: ($env['DB_PASSWORD'] ?? '');
$dbName = getenv('DB_NAME') ?: ($env['DB_NAME'] ?? 'art_flair');

try {
    $dsn = "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 8
    ];
    if (str_contains($dbHost, 'aivencloud.com')) {
        $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
    }
    $pdo = new PDO($dsn, $dbUser, $dbPass, $options);
} catch (PDOException $e) {
    // Attempt local fallback if remote connection is unavailable
    try {
        $dsnFallback = "mysql:host=localhost;port=3306;dbname=art_flair;charset=utf8mb4";
        $pdo = new PDO($dsnFallback, 'root', '123456', [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 4
        ]);
    } catch (PDOException $e2) {
        echo json_encode([
            'success' => false,
            'error' => 'Database connection failed: ' . $e->getMessage()
        ], JSON_PRETTY_PRINT);
        exit(1);
    }
}

// 1. Fetch Order & User Details from Database
$stmt = $pdo->prepare("
    SELECT 
        o.order_id,
        o.user_id,
        o.order_date,
        o.total_amount,
        o.order_status,
        o.shipping_address,
        u.first_name,
        u.last_name,
        u.email AS user_email,
        u.phone AS user_phone
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.user_id
    WHERE o.order_id = ?
    LIMIT 1;
");
$stmt->execute([$orderId]);
$order = $stmt->fetch();

if (!$order) {
    echo json_encode([
        'success' => false,
        'error' => "Order '{$orderId}' not found in database orders table."
    ], JSON_PRETTY_PRINT);
    exit(1);
}

// 2. Fetch Order Items & Inventory Stock Details from Database
$itemsStmt = $pdo->prepare("
    SELECT 
        oi.order_item_id,
        oi.product_id,
        oi.quantity,
        oi.price,
        oi.subtotal,
        p.product_name,
        p.brand,
        p.product_image,
        c.category_name,
        COALESCE(i.quantity, 0) AS current_stock
    FROM order_items oi
    LEFT JOIN products p ON oi.product_id = p.product_id
    LEFT JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN inventory i ON p.product_id = i.product_id
    WHERE oi.order_id = ?;
");
$itemsStmt->execute([$orderId]);
$orderItems = $itemsStmt->fetchAll();

// Resolve customer details
$customerName = trim(($order['first_name'] ?? '') . ' ' . ($order['last_name'] ?? ''));
if (empty($customerName)) {
    $customerName = 'Art Patron';
}
$recipientEmail = $order['user_email'] ?? null;
if (empty($recipientEmail)) {
    echo json_encode([
        'success' => false,
        'error' => "No registered email found for patron {$order['user_id']} on order {$orderId}."
    ], JSON_PRETTY_PRINT);
    exit(1);
}

$grandTotal = (float)$order['total_amount'];
$orderDate = $order['order_date'] ?? date('Y-m-d H:i:s');
$trackingCode = "SBZ-{$orderId}";
$shippingAddress = $order['shipping_address'] ?? 'Registered Studio Atelier Address, India';

// Calculate subtotal from items
$itemsSubtotal = 0.0;
foreach ($orderItems as $item) {
    $itemsSubtotal += (float)$item['subtotal'];
}
$shippingFee = ($itemsSubtotal > 1000) ? round($itemsSubtotal * 0.005, 2) : 0.00;
$shippingDisplay = ($shippingFee === 0.0) ? 'FREE' : '₹' . number_format($shippingFee, 2);

$orderStatus = $statusArg ? ucfirst($statusArg) : ucfirst($order['order_status'] ?? 'Confirmed');
$orderStatusLower = strtolower($orderStatus);

// Generate Items HTML Table
$itemsHtml = '';
$itemsPlain = '';
foreach ($orderItems as $it) {
    $pName = htmlspecialchars($it['product_name'] ?? 'Fine Art Supply');
    $qty = (int)$it['quantity'];
    $price = (float)$it['price'];
    $sub = (float)$it['subtotal'];
    $cat = htmlspecialchars($it['category_name'] ?? 'Medium');
    $stock = (int)$it['current_stock'];

    $stockNote = ($orderStatusLower === 'cancelled')
        ? "⚡ Order Cancelled: Stock Restored (+{$qty}) • Current DB Stock: {$stock}"
        : "🔻 Order Checkout: Stock Deducted (-{$qty}) • Current DB Stock: {$stock}";

    $itemsHtml .= "
    <tr style='border-bottom: 1px solid #E5E7EB;'>
      <td style='padding: 12px 8px; font-size: 14px;'>
        <strong style='color: #4A1D5E;'>{$pName}</strong><br/>
        <span style='font-size: 12px; color: #6B7280;'>Category: {$cat}</span><br/>
        <span style='font-size: 11px; color: #4338CA; font-weight: 600; background: #EEF2FF; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 3px;'>{$stockNote}</span>
      </td>
      <td style='padding: 12px 8px; font-size: 14px; text-align: center; color: #374151;'>{$qty}</td>
      <td style='padding: 12px 8px; font-size: 14px; text-align: right; color: #374151;'>₹" . number_format($price, 2) . "</td>
      <td style='padding: 12px 8px; font-size: 14px; text-align: right; font-weight: 700; color: #111827;'>₹" . number_format($sub, 2) . "</td>
    </tr>";

    $itemsPlain .= "- {$pName} x {$qty} @ INR " . number_format($price, 2) . " = INR " . number_format($sub, 2) . " ({$stockNote})\n";
}

// Plain Text Email Body
$plainBody = "
Art Flair | Sabahz Trading - Order Confirmation
==================================================
Dear {$customerName},

Thank you for your order! Your studio materials have been confirmed and booked.

ORDER DETAILS:
--------------------------------------------------
Order ID:        #{$orderId}
Order Date:      {$orderDate}
Tracking Number: {$trackingCode}
Delivery To:     {$shippingAddress}

PURCHASED MATERIALS (FETCHED FROM DATABASE):
--------------------------------------------------
{$itemsPlain}
--------------------------------------------------
Items Subtotal:  INR " . number_format($itemsSubtotal, 2) . "
Sabahz Shipping: INR " . number_format($shippingFee, 2) . " ({$shippingDisplay})
GST (0%):        INR 0.00
GRAND TOTAL:     INR " . number_format($grandTotal, 2) . "

All materials are sealed in Sabahz Climate-Safe packaging.
Thank you for supporting artisanal art mediums!
";

// HTML Email Body
$htmlBody = "<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <title>Order Confirmed #{$orderId}</title>
</head>
<body style=\"font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F9FA; margin: 0; padding: 24px; color: #1F2937;\">
  <table width='100%' border='0' cellspacing='0' cellpadding='0'>
    <tr>
      <td align='center'>
        <table width='600' border='0' cellspacing='0' cellpadding='0' style='max-width: 600px; background-color: #FFFFFF; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,0.06); border: 1px solid #E5E7EB;'>
          <tr>
            <td style='background: linear-gradient(135deg, #4A1D5E 0%, #2D1138 100%); padding: 32px 28px; text-align: center; color: #FFFFFF;'>
              <h1 style='margin: 0; font-size: 26px; font-weight: 700;'>Art Flair</h1>
              <div style='font-size: 13px; color: #E9D5FF; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.08em;'>Sabahz Trading Atelier • Order Receipt</div>
            </td>
          </tr>

          <tr>
            <td style='padding: 28px 28px 16px; text-align: center;'>
              <div style='display: inline-block; background-color: #ECFDF5; color: #065F46; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 700; margin-bottom: 12px;'>
                ✓ Order Confirmed & Paid
              </div>
              <h2 style='margin: 0 0 8px; font-size: 22px; color: #111827;'>Thank you, " . htmlspecialchars($customerName) . "!</h2>
              <p style='margin: 0; font-size: 14px; color: #4B5563; line-height: 1.5;'>
                Your order has been verified directly against our MySQL database inventory.
              </p>
            </td>
          </tr>

          <tr>
            <td style='padding: 12px 28px;'>
              <table width='100%' style='background-color: #FAF5FF; border: 1px solid #E9D5FF; border-radius: 10px; padding: 14px;' cellspacing='0' cellpadding='0'>
                <tr>
                  <td width='50%' style='padding: 6px 8px; vertical-align: top;'>
                    <div style='font-size: 11px; text-transform: uppercase; color: #6B7280; font-weight: 700;'>Order Reference</div>
                    <div style='font-size: 15px; font-weight: 700; color: #4A1D5E; font-family: monospace;'>#{$orderId}</div>
                  </td>
                  <td width='50%' style='padding: 6px 8px; vertical-align: top;'>
                    <div style='font-size: 11px; text-transform: uppercase; color: #6B7280; font-weight: 700;'>Tracking Number</div>
                    <div style='font-size: 15px; font-weight: 700; color: #0284C7; font-family: monospace;'>{$trackingCode}</div>
                  </td>
                </tr>
                <tr>
                  <td width='50%' style='padding: 6px 8px; vertical-align: top;'>
                    <div style='font-size: 11px; text-transform: uppercase; color: #6B7280; font-weight: 700;'>Order Date</div>
                    <div style='font-size: 13px; color: #1F2937;'>{$orderDate}</div>
                  </td>
                  <td width='50%' style='padding: 6px 8px; vertical-align: top;'>
                    <div style='font-size: 11px; text-transform: uppercase; color: #6B7280; font-weight: 700;'>Delivery Address</div>
                    <div style='font-size: 13px; color: #1F2937;'>" . htmlspecialchars($shippingAddress) . "</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style='padding: 16px 28px;'>
              <h3 style='margin: 0 0 12px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em; color: #374151;'>Purchased Materials</h3>
              <table width='100%' cellspacing='0' cellpadding='0' style='border-collapse: collapse;'>
                <thead>
                  <tr style='background-color: #F9FAFB; border-bottom: 2px solid #E5E7EB;'>
                    <th align='left' style='padding: 10px 8px; font-size: 12px; color: #4B5563;'>Item</th>
                    <th align='center' style='padding: 10px 8px; font-size: 12px; color: #4B5563;'>Qty</th>
                    <th align='right' style='padding: 10px 8px; font-size: 12px; color: #4B5563;'>Price</th>
                    <th align='right' style='padding: 10px 8px; font-size: 12px; color: #4B5563;'>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {$itemsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <tr>
            <td style='padding: 12px 28px 24px;'>
              <table width='100%' cellspacing='0' cellpadding='0' style='border-top: 1px solid #E5E7EB; padding-top: 14px;'>
                <tr>
                  <td style='padding: 4px 0; color: #4B5563; font-size: 14px;'>Items Subtotal</td>
                  <td style='padding: 4px 0; text-align: right; color: #111827; font-size: 14px;'>₹" . number_format($itemsSubtotal, 2) . "</td>
                </tr>
                <tr>
                  <td style='padding: 4px 0; color: #4B5563; font-size: 14px;'>Sabahz Studio Shipping</td>
                  <td style='padding: 4px 0; text-align: right; font-size: 14px; font-weight: 700; color: #10B981;'>{$shippingDisplay}</td>
                </tr>
                <tr>
                  <td style='padding: 4px 0; color: #4B5563; font-size: 14px;'>Estimated GST (0%)</td>
                  <td style='padding: 4px 0; text-align: right; color: #6B7280; font-size: 14px;'>₹0.00</td>
                </tr>
                <tr style='border-top: 2px solid #E5E7EB;'>
                  <td style='padding: 12px 0 0; color: #4A1D5E; font-size: 18px; font-weight: 800;'>Total Amount Paid</td>
                  <td style='padding: 12px 0 0; text-align: right; color: #4A1D5E; font-size: 20px; font-weight: 800;'>₹" . number_format($grandTotal, 2) . "</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style='background-color: #F9FAFB; padding: 24px 28px; border-top: 1px solid #E5E7EB; text-align: center; font-size: 12px; color: #6B7280; line-height: 1.6;'>
              <div>Receipt dispatched to registered email <strong>" . htmlspecialchars($recipientEmail) . "</strong> via PHPMailer.</div>
              <div style='margin-top: 4px;'>Art Flair • Sabahz Trading • Verified Database Transaction</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";

// Save local inspection copy
$sentDir = is_dir(__DIR__ . '/uploads') ? __DIR__ . '/uploads/sent_emails' : __DIR__ . '/backend/uploads/sent_emails';
if (!is_dir($sentDir)) {
    @mkdir($sentDir, 0777, true);
}
@file_put_contents("{$sentDir}/order_{$orderId}_phpmailer.html", $htmlBody);

// Initialize PHPMailer
$mail = new PHPMailer(true);

$smtpHost = getenv('SMTP_HOST') ?: ($env['SMTP_HOST'] ?? 'smtp.gmail.com');
$smtpPort = (int)(getenv('SMTP_PORT') ?: ($env['SMTP_PORT'] ?? 587));
$smtpUser = getenv('SMTP_USER') ?: ($env['SMTP_USER'] ?? '');
$smtpPass = getenv('SMTP_PASSWORD') ?: ($env['SMTP_PASSWORD'] ?? '');
$fromEmail = getenv('SMTP_FROM_EMAIL') ?: ($env['SMTP_FROM_EMAIL'] ?? ($smtpUser ?: 'orders@artflair.com'));
$fromName = getenv('SMTP_FROM_NAME') ?: ($env['SMTP_FROM_NAME'] ?? 'Art Flair - Sabahz Trading');

$sentLive = false;
$emailError = null;

if (!empty($smtpUser) && !empty($smtpPass)) {
    try {
        $mail->isSMTP();
        $mail->Host       = $smtpHost;
        $mail->SMTPAuth   = true;
        $mail->Username   = $smtpUser;
        $mail->Password   = $smtpPass;
        $mail->SMTPSecure = ($smtpPort === 465) ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = $smtpPort;
        $mail->CharSet    = 'UTF-8';

        $mail->setFrom($fromEmail, $fromName);
        $mail->addAddress($recipientEmail, $customerName);

        $mail->isHTML(true);
        $mail->Subject = "Order {$orderStatus}: #{$orderId} - Art Flair | Sabahz Trading";
        $mail->Body    = $htmlBody;
        $mail->AltBody = $plainBody;

        $mail->send();
        $sentLive = true;
    } catch (Exception $e) {
        $emailError = $mail->ErrorInfo;
    }
}

// Output authoritative JSON response
echo json_encode([
    'success' => true,
    'mailer' => 'PHPMailer 6.9+',
    'orderId' => $orderId,
    'recipientEmail' => $recipientEmail,
    'customerName' => $customerName,
    'orderDate' => $orderDate,
    'totalAmount' => $grandTotal,
    'itemsCount' => count($orderItems),
    'liveSmtpSent' => $sentLive,
    'emailError' => $emailError,
    'message' => $sentLive 
        ? "Order confirmation email sent via PHPMailer to {$recipientEmail}" 
        : "Order confirmation assembled via PHPMailer for {$recipientEmail} (Inspection copy saved to uploads/sent_emails/)"
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

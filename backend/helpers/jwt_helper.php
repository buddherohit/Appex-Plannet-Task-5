<?php
class JWTHelper {
    private static $secret_key = "careerbridge_secure_jwt_token_key_industry_capstone";

    private static function base64UrlEncode($data) {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    private static function base64UrlDecode($data) {
        $remainder = strlen($data) % 4;
        if ($remainder) {
            $padlen = 4 - $remainder;
            $data .= str_repeat('=', $padlen);
        }
        return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
    }

    public static function generate($payload, $expiry_seconds = 86400) {
        $header = json_encode([
            "alg" => "HS256",
            "typ" => "JWT"
        ]);

        $payload['exp'] = time() + $expiry_seconds;
        $payload['iat'] = time();

        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode(json_encode($payload));

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::$secret_key, true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public static function decode($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $parts;

        $signature = self::base64UrlDecode($base64UrlSignature);
        $expected_signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::$secret_key, true);

        if (!hash_equals($signature, $expected_signature)) {
            return null;
        }

        $payload = json_decode(self::base64UrlDecode($base64UrlPayload), true);

        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return null; // Expired
        }

        return $payload;
    }

    public static function getBearerToken() {
        $headers = getallheaders();
        $auth_header = "";
        
        // Find Authorization header (case-insensitive check)
        foreach ($headers as $key => $value) {
            if (strcasecmp($key, 'Authorization') === 0) {
                $auth_header = $value;
                break;
            }
        }

        if (empty($auth_header)) {
            // Check redirect authorization header
            if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
                $auth_header = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
            } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
                $auth_header = $_SERVER['HTTP_AUTHORIZATION'];
            }
        }

        if (!empty($auth_header)) {
            if (preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
                return $matches[1];
            }
        }
        return null;
    }

    public static function getAuthenticatedUser() {
        $token = self::getBearerToken();
        if (!$token) {
            return null;
        }
        return self::decode($token);
    }

    public static function requireAuth() {
        $user = self::getAuthenticatedUser();
        if (!$user) {
            http_response_code(418); // Use standard 401 Unauthorized
            http_response_code(401);
            echo json_encode([
                "success" => false,
                "message" => "Unauthorized access. Token is invalid or expired."
            ]);
            exit();
        }
        return $user;
    }

    public static function requireAdmin() {
        $user = self::requireAuth();
        if ($user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode([
                "success" => false,
                "message" => "Forbidden. Admin privileges required."
            ]);
            exit();
        }
        return $user;
    }
}
?>

<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class LoginController
{
    private function db()
    {
        return new MySQLi(
            getenv('DB_HOST'),
            getenv('DB_USERNAME'),
            getenv('DB_PASSWORD'),
            getenv('DB_DATABASE')
        );
    }

    public function login(Request $request, Response $response, $args)
    {
        $db = $this->db();

        $data = $request->getParsedBody();

        $login = trim($data['login'] ?? $data['username'] ?? '');
        $password = $data['password'] ?? '';

        if ($login === '' || $password === '') {
            $response->getBody()->write(json_encode([
                "error" => "Credenziali mancanti"
            ]));
            return $response->withStatus(400)->withHeader("Content-Type", "application/json");
        }

        $stmt = $db->prepare("
            SELECT id, username, email, password
            FROM account 
            WHERE username = ? OR email = ?
            LIMIT 1
        ");

        $stmt->bind_param("ss", $login, $login);
        $stmt->execute();

        $result = $stmt->get_result();
        $user = $result->fetch_assoc();

        if (!$user || !password_verify($password, $user['password'])) {
            $response->getBody()->write(json_encode([
                "error" => "Credenziali errate"
            ]));
            return $response->withStatus(401)->withHeader("Content-Type", "application/json");
        }

        $response->getBody()->write(json_encode([
            "message" => "Login OK",
            "user_id" => $user['id']
        ]));

        return $response->withHeader("Content-Type", "application/json");
    }
}

<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AccountController
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

    public function create(Request $request, Response $response, $args)
    {
        $db = $this->db();

        $data = $request->getParsedBody();

        $username = trim($data['username'] ?? '');
        $email = strtolower(trim($data['email'] ?? ''));
        $plainPassword = $data['password'] ?? '';
        $altezza = (int) ($data['altezza'] ?? 0);
        $peso = (int) ($data['peso'] ?? 0);
        $genere = $data['genere'] ?? null;

        if ($username === '' || $email === '' || $plainPassword === '') {
            $response->getBody()->write(json_encode([
                "error" => "Username, email e password sono obbligatori"
            ]));
            return $response->withStatus(400)->withHeader("Content-Type", "application/json");
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $response->getBody()->write(json_encode([
                "error" => "Email non valida"
            ]));
            return $response->withStatus(400)->withHeader("Content-Type", "application/json");
        }

        $password = password_hash($plainPassword, PASSWORD_BCRYPT);

        $stmt = $db->prepare("
            INSERT INTO account (username, email, password, altezza, peso, genere)
            VALUES (?, ?, ?, ?, ?, ?)
        ");

        $stmt->bind_param(
            "sssiis",
            $username,
            $email,
            $password,
            $altezza,
            $peso,
            $genere
        );

        try {
            $stmt->execute();
        } catch (mysqli_sql_exception $e) {
            $status = $e->getCode() === 1062 ? 409 : 500;
            $message = $e->getCode() === 1062
                ? "Username o email già in uso"
                : "Errore creazione account";

            $response->getBody()->write(json_encode([
                "error" => $message
            ]));
            return $response->withStatus($status)->withHeader("Content-Type", "application/json");
        }

        $response->getBody()->write(json_encode([
            "message" => "Account creato con successo"
        ]));

        return $response->withHeader("Content-Type", "application/json");
    }

    public function get(Request $request, Response $response, $args)
    {
        $db = $this->db();

        $id = $args['id'];

        $stmt = $db->prepare("
            SELECT id, username, email, altezza, peso, genere
            FROM account
            WHERE id = ?
        ");

        $stmt->bind_param("i", $id);
        $stmt->execute();

        $result = $stmt->get_result();

        $response->getBody()->write(json_encode($result->fetch_assoc()));

        return $response->withHeader("Content-Type", "application/json");
    }

    public function update(Request $request, Response $response, $args)
    {
        $db = $this->db();

        $id = $args['id'];
        $data = $request->getParsedBody();

        $altezza = (int) ($data['altezza'] ?? 0);
        $peso = (int) ($data['peso'] ?? 0);
        $genere = $data['genere'] ?? null;

        $stmt = $db->prepare("
            UPDATE account
            SET altezza = ?, peso = ?, genere = ?
            WHERE id = ?
        ");

        $stmt->bind_param("iisi", $altezza, $peso, $genere, $id);

        try {
            $stmt->execute();
        } catch (mysqli_sql_exception $e) {
            $response->getBody()->write(json_encode([
                "error" => "Errore aggiornamento account"
            ]));
            return $response->withStatus(500)->withHeader("Content-Type", "application/json");
        }

        $response->getBody()->write(json_encode([
            "message" => "Account aggiornato"
        ]));

        return $response->withHeader("Content-Type", "application/json");
    }

    public function resetSession(Request $request, Response $response, $args)
    {
        $db = $this->db();
        $id = (int) $args['id'];

        $stmt = $db->prepare('DELETE FROM account_alcol WHERE account_id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $drinksDeleted = $stmt->affected_rows;

        $stmt = $db->prepare('DELETE FROM account_stato_sazieta WHERE account_id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $foodDeleted = $stmt->affected_rows;

        $response->getBody()->write(json_encode([
            'message' => 'Sessione azzerata',
            'drinks_deleted' => $drinksDeleted,
            'food_deleted' => $foodDeleted,
        ]));

        return $response->withHeader('Content-Type', 'application/json');
    }
}

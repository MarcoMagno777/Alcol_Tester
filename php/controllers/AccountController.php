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

        $username = $data['username'];
        $password = password_hash($data['password'], PASSWORD_BCRYPT);
        $altezza = $data['altezza'];
        $peso = $data['peso'];
        $genere = $data['genere'];

        $stmt = $db->prepare("
            INSERT INTO account (username, password, altezza, peso, genere)
            VALUES (?, ?, ?, ?, ?)
        ");

        $stmt->bind_param(
            "sssis",
            $username,
            $password,
            $altezza,
            $peso,
            $genere
        );

        if (!$stmt->execute()) {
            $response->getBody()->write(json_encode([
                "error" => "Errore creazione account"
            ]));
            return $response->withStatus(500)->withHeader("Content-Type", "application/json");
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
            SELECT id, username, altezza, peso, genere
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

        $altezza = $data['altezza'];
        $peso = $data['peso'];
        $genere = $data['genere'];

        $stmt = $db->prepare("
            UPDATE account
            SET altezza = ?, peso = ?, genere = ?
            WHERE id = ?
        ");

        $stmt->bind_param("iisi", $altezza, $peso, $genere, $id);

        $stmt->execute();

        $response->getBody()->write(json_encode([
            "message" => "Account aggiornato"
        ]));

        return $response->withHeader("Content-Type", "application/json");
    }
}
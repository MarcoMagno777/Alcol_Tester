<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AlcolController
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

    public function add(Request $request, Response $response, $args)
    {
        $db = $this->db();
        $data = $request->getParsedBody();

        $account_id = $data['account_id'];
        $alcol_id = $data['alcol_id'];
        $data_consumo = $data['data_consumo'];

        $stmt = $db->prepare("
            INSERT INTO account_alcol (account_id, alcol_id, data_consumo)
            VALUES (?, ?, ?)
        ");

        $stmt->bind_param("iis", $account_id, $alcol_id, $data_consumo);
        $stmt->execute();

        $response->getBody()->write(json_encode([
            "message" => "Inserito"
        ]));

        return $response->withHeader("Content-Type", "application/json");
    }

    public function getByAccount(Request $request, Response $response, $args)
    {
        $db = $this->db();

        $account_id = $args['id'];

        $stmt = $db->prepare("
            SELECT a.nome, a.quantita, a.gradazione, aa.data_consumo
            FROM account_alcol aa
            JOIN alcol a ON a.id = aa.alcol_id
            WHERE aa.account_id = ?
        ");

        $stmt->bind_param("i", $account_id);
        $stmt->execute();

        $result = $stmt->get_result();
        $data = $result->fetch_all(MYSQLI_ASSOC);

        $response->getBody()->write(json_encode($data));

        return $response->withHeader("Content-Type", "application/json");
    }
}
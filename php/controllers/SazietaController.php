<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class SazietaController
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
        $cibo_id = $data['stato_sazieta_id'];
        $data_consumo = $data['data_consumo'];

        $stmt = $db->prepare("
            INSERT INTO account_stato_sazieta (account_id, cibo_id, data_consumo)
            VALUES (?, ?, ?)
        ");

        $stmt->bind_param("iis", $account_id, $cibo_id, $data_consumo);
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
            SELECT ss.nome, ss.descrizione, ass.data_consumo
            FROM account_stato_sazieta ass
            JOIN stato_sazieta ss ON ss.id = ass.cibo_id
            WHERE ass.account_id = ?
        ");

        $stmt->bind_param("i", $account_id);
        $stmt->execute();

        $result = $stmt->get_result();
        $data = $result->fetch_all(MYSQLI_ASSOC);

        $response->getBody()->write(json_encode($data));

        return $response->withHeader("Content-Type", "application/json");
    }
}
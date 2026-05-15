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

    private function json(Response $response, $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data));
        return $response->withStatus($status)->withHeader('Content-Type', 'application/json');
    }

    public function listCatalog(Request $request, Response $response, $args)
    {
        $db = $this->db();
        $result = $db->query('SELECT id, nome, quantita, gradazione FROM alcol ORDER BY nome, quantita');
        return $this->json($response, $result->fetch_all(MYSQLI_ASSOC));
    }

    public function add(Request $request, Response $response, $args)
    {
        $db = $this->db();
        $data = $request->getParsedBody();

        $account_id = $data['account_id'];
        $alcol_id = $data['alcol_id'];
        $data_consumo = $data['data_consumo'] ?? date('Y-m-d');
        $consumato_il = $data['consumato_il'] ?? date('Y-m-d H:i:s');

        $stmt = $db->prepare('
            INSERT INTO account_alcol (account_id, alcol_id, data_consumo, consumato_il)
            VALUES (?, ?, ?, ?)
        ');

        $stmt->bind_param('iiss', $account_id, $alcol_id, $data_consumo, $consumato_il);
        $stmt->execute();

        return $this->json($response, [
            'message' => 'Inserito',
            'id' => $db->insert_id,
        ]);
    }

    public function getByAccount(Request $request, Response $response, $args)
    {
        $db = $this->db();
        $account_id = $args['id'];

        $stmt = $db->prepare('
            SELECT
                aa.id,
                aa.alcol_id,
                aa.data_consumo,
                aa.consumato_il,
                a.nome,
                a.quantita,
                a.gradazione
            FROM account_alcol aa
            JOIN alcol a ON a.id = aa.alcol_id
            WHERE aa.account_id = ?
            ORDER BY aa.consumato_il DESC
        ');

        $stmt->bind_param('i', $account_id);
        $stmt->execute();

        return $this->json($response, $stmt->get_result()->fetch_all(MYSQLI_ASSOC));
    }
}

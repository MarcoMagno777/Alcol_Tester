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

    private function json(Response $response, $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data));
        return $response->withStatus($status)->withHeader('Content-Type', 'application/json');
    }

    public function listCatalog(Request $request, Response $response, $args)
    {
        $db = $this->db();
        $result = $db->query('SELECT id, nome, descrizione FROM stato_sazieta ORDER BY id');
        return $this->json($response, $result->fetch_all(MYSQLI_ASSOC));
    }

    public function add(Request $request, Response $response, $args)
    {
        $db = $this->db();
        $data = $request->getParsedBody();

        $account_id = $data['account_id'];
        $stato_sazieta_id = $data['stato_sazieta_id'] ?? $data['cibo_id'] ?? null;
        $data_consumo = $data['data_consumo'] ?? date('Y-m-d');
        $consumato_il = $data['consumato_il'] ?? date('Y-m-d H:i:s');

        if ($stato_sazieta_id === null) {
            return $this->json($response, ['error' => 'Campo stato_sazieta_id mancante'], 400);
        }

        $stmt = $db->prepare('
            INSERT INTO account_stato_sazieta (account_id, stato_sazieta_id, data_consumo, consumato_il)
            VALUES (?, ?, ?, ?)
        ');

        $stmt->bind_param('iiss', $account_id, $stato_sazieta_id, $data_consumo, $consumato_il);
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
                ass.id,
                ass.stato_sazieta_id,
                ass.data_consumo,
                ass.consumato_il,
                ss.nome,
                ss.descrizione
            FROM account_stato_sazieta ass
            JOIN stato_sazieta ss ON ss.id = ass.stato_sazieta_id
            WHERE ass.account_id = ?
            ORDER BY ass.consumato_il DESC
        ');

        $stmt->bind_param('i', $account_id);
        $stmt->execute();

        return $this->json($response, $stmt->get_result()->fetch_all(MYSQLI_ASSOC));
    }
}

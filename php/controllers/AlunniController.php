<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AlunniController
{
  public function index(Request $request, Response $response, $args){
    $host = getenv('DB_HOST') ?: 'db';
    $database = getenv('DB_DATABASE') ?: 'scuola';
    $username = getenv('DB_USERNAME') ?: 'scuola';
    $password = getenv('DB_PASSWORD') ?: 'scuola';

    $mysqli_connection = new MySQLi($host, $username, $password, $database);
    $result = $mysqli_connection->query("SELECT * FROM alunni");
    $results = $result->fetch_all(MYSQLI_ASSOC);

    $response->getBody()->write(json_encode($results));
    return $response->withHeader("Content-type", "application/json")->withStatus(200);
  }
}

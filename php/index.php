<?php
use Slim\Factory\AppFactory;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/controllers/AlunniController.php';

$app = AppFactory::create();

$app->get('/test', function (Request $request, Response $response, array $args) {
    $response->getBody()->write("Test page");
    return $response;
});

$app->get('/up', function (Request $request, Response $response, array $args) {
    $response->getBody()->write("OK");
    return $response;
});

$app->get('/', function (Request $request, Response $response, array $args) {
    $payload = json_encode(['status' => 'ok']);
    $response->getBody()->write($payload);
    return $response->withHeader("Content-type", "application/json");
});

$app->get('/hello/{name}', function (Request $request, Response $response, array $args) {
    $name = $args['name'];
    $response->getBody()->write("Hello, $name");
    return $response;
});

$app->get('/alunni', "AlunniController:index");
$app->get('/api/alunni', "AlunniController:index");

$app->run();

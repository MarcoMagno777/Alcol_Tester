<?php
use Slim\Factory\AppFactory;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/controllers/LoginController.php';
require __DIR__ . '/controllers/AccountController.php';
require __DIR__ . '/controllers/AlcolController.php';
require __DIR__ . '/controllers/SazietaController.php';

$app = AppFactory::create();

$app->addBodyParsingMiddleware();

$app->post('/accounts/login', 'LoginController:login');
$app->post('/accounts/create', 'AccountController:create');

$app->delete('/accounts/{id}/session', 'AccountController:resetSession');
$app->get('/accounts/{id}', 'AccountController:get');
$app->put('/accounts/{id}', 'AccountController:update');

$app->get('/alcol/catalog', 'AlcolController:listCatalog');
$app->post('/alcol', 'AlcolController:add');
$app->get('/alcol/{id}', 'AlcolController:getByAccount');

$app->get('/sazieta/catalog', 'SazietaController:listCatalog');
$app->post('/sazieta', 'SazietaController:add');
$app->get('/sazieta/{id}', 'SazietaController:getByAccount');

$app->run();

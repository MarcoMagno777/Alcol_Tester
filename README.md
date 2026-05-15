# Alcol Tester

Applicazione didattica per stimare il **tasso alcolemico** in base a drink consumati, dati fisici dell'utente e stato di sazietà. Il progetto è composto da:

- **Backend** PHP con Slim Framework e MariaDB
- **Frontend** Angular 19
- **Docker Compose** per lo sviluppo locale

## Funzionalità

### Autenticazione (`/auth`)
- Login con username e password
- Registrazione con altezza, peso e genere (M/F)
- Dopo login/registrazione si viene reindirizzati alla home

### Home (`/home`)
- **Tasso alcolemico** stimato al centro (g/L), aggiornato ogni secondo
- **Countdown** verso 0.000 g/L (tempo stimato di eliminazione)
- **Barra a fasce colorate** con quattro zone:
  - **Sobrio** (verde): 0 – 0.30 g/L
  - **Alticcio** (giallo): 0.30 – 0.50 g/L
  - **Fase perfetta** (arancione): 0.50 – 0.80 g/L
  - **Pericolo** (rosso): oltre 0.80 g/L
- **Puntino anteprima** (azzurro) sulla barra quando si seleziona un drink prima di confermarlo
- Pulsante **Account** (in alto a sinistra) per modificare altezza, peso e genere
- Componente **Drink**: scelta dal catalogo DB e registrazione consumo
- Componente **Cibo**: registrazione stato di sazietà (influisce sull'assorbimento)

### Calcolo BAC (frontend)
Il servizio `BacService` implementa un modello semplificato tipo **Widmark**:

1. Grammi di alcol puro per drink: `volume_ml × (gradazione/100) × 0.789`
2. Picco iniziale: `grammi / (r × peso_kg)` con `r = 0.68` (M) o `0.55` (F)
3. Moltiplicatore sazietà (ultimo pasto prima del drink):
   - Stomaco vuoto: 1.00
   - Mangiato un pochino: 0.88
   - Meta: 0.72
   - Pieno: 0.55
4. Eliminazione: **0.15 g/L/ora** per ogni drink dal momento `consumato_il`
5. Il tasso totale è la **somma** del residuo di ogni drink registrato

> Nota: è una stima didattica, non sostituisce strumenti di misura o pareri medico-legali.

## API REST (Slim)

| Metodo | Rotta | Descrizione |
|--------|-------|-------------|
| POST | `/accounts/create` | Registrazione |
| POST | `/accounts/login` | Login |
| GET | `/accounts/{id}` | Profilo account |
| PUT | `/accounts/{id}` | Aggiorna altezza, peso, genere |
| GET | `/alcol/catalog` | Catalogo drink |
| POST | `/alcol` | Registra drink consumato |
| GET | `/alcol/{accountId}` | Storico drink utente |
| GET | `/sazieta/catalog` | Catalogo stati sazietà |
| POST | `/sazieta` | Registra pasto/sazietà |
| GET | `/sazieta/{accountId}` | Storico sazietà utente |

## Struttura repository

```
Alcol_Tester/
├── app/                    # Frontend Angular
│   └── src/app/
│       ├── components/     # auth, home, account, drink, food, bac-bar
│       ├── services/       # api, auth, bac
│       ├── models/         # interfacce TypeScript
│       └── guards/         # auth guard
├── php/                    # API Slim + controller
├── build/
│   ├── init.sql            # Schema DB e dati seed
│   ├── migrate_consumato_il.sql
│   ├── Dockerfile.php
│   ├── Dockerfile.node
│   └── entrypoint-*.sh
├── docker-compose.yaml
├── test_api.php            # Script test API da terminale
└── config/deploy.yml       # Deploy Kamal (solo backend)
```

## Avvio con Docker

```bash
cp .env.example .env   # opzionale
docker compose up --build
```

Servizi:

- **Frontend Angular**: http://localhost:5173
- **API PHP**: http://localhost:8080
- **phpMyAdmin** (opzionale): `docker compose --profile tools up`

### Reset database

```bash
docker compose down -v
docker compose up --build
```

Se aggiorni un database esistente senza ricrearlo, applica la migrazione:

```bash
docker compose exec db mariadb -uutente -p db_alcol_tester < build/migrate_consumato_il.sql
```

(adatta utente, password e nome DB al tuo `.env`)

## Sviluppo frontend senza Docker

```bash
cd app
npm install
npm start
```

Il proxy in `app/proxy.conf.json` inoltra le chiamate API a `http://api:80` (Docker). Per sviluppo solo locale modifica il target in `http://localhost:8080`.

## Test API

```bash
php test_api.php
```

## Deploy Kamal

Il deploy con Kamal riguarda solo il **backend** Slim. Il frontend Angular va pubblicato separatamente (build statico con `ng build`) oppure usato in laboratorio via Docker.

Vedi `.env.example` per `KAMAL_HOST`, `KAMAL_DOMAIN`, credenziali registry e database.

```bash
kamal setup    # primo deploy
kamal deploy   # deploy successivi
```

## Credenziali database

Valori predefiniti in `docker-compose.yaml` se manca `.env`. Con `.env.example`:

- Database: `db_alcol_tester`
- Utente: `utente`
- Password: vedi `.env`

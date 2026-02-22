# 🚗 GRIDLOCK API

Backend da aplicação **GRIDLOCK** — plataforma de encontros para entusiastas de carros.

## Stack

- **Node.js** + **Express** — servidor REST
- **PostgreSQL** + **Prisma ORM** — banco de dados
- **JWT** + **Bcrypt** — autenticação
- **Socket.io** — chat em tempo real
- **AWS S3** — upload de imagens

## Instalação e execução

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose

### Opção 1 — Dev local com banco em container (recomendado)

```bash
# Clone o repo
git clone https://github.com/seu-usuario/gridlock-api.git
cd gridlock-api

# Suba apenas o banco de dados
docker compose up -d db

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# O DATABASE_URL padrão já aponta para localhost:5432, sem alterações necessárias

# Rode as migrations
npm run prisma:migrate

# Inicie em desenvolvimento (hot reload)
npm run dev
```

### Opção 2 — Tudo em containers

```bash
cp .env.example .env
# Edite o .env com suas credenciais (JWT_SECRET, etc.)

docker compose --profile full up --build
```

> A API ficará disponível em `http://localhost:3000`.
> O serviço `api` aguarda o banco estar saudável antes de iniciar.

### Parar os containers

```bash
docker compose down        # para e remove os containers
docker compose down -v     # também remove o volume do banco
```

## Estrutura

```
src/
├── config/         # db, env, s3
├── middlewares/    # auth, role, upload
├── modules/
│   ├── auth/       # register, login, refresh
│   ├── users/      # perfil, garagem de carros
│   ├── events/     # CRUD, participantes
│   ├── chat/       # mensagens + Socket.io
│   └── moderation/ # aprovação de eventos
└── utils/          # erros, paginação
```

## Rotas principais

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /auth/register | Criar conta |
| POST | /auth/login | Login |
| GET | /events | Listar eventos |
| POST | /events | Criar evento |
| POST | /events/:id/join | Participar de evento |

## Perfis de usuário

- **PARTICIPANT** — descobre e participa de eventos
- **ORGANIZER** — cria e gerencia eventos
- **ADMIN** — modera eventos na plataforma

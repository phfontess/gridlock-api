# 🚗 GRIDLOCK API

Backend da aplicação **GRIDLOCK** — plataforma de encontros para entusiastas de carros.

## Stack

- **Node.js** + **Express** — servidor REST
- **PostgreSQL** + **Prisma ORM** — banco de dados
- **JWT** + **Bcrypt** — autenticação
- **Socket.io** — chat em tempo real
- **AWS S3** — upload de imagens

## Instalação

```bash
# Clone o repo
git clone https://github.com/seu-usuario/gridlock-api.git
cd gridlock-api

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# Rode as migrations
npx prisma migrate dev

# Inicie em desenvolvimento
npm run dev
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

# Bot Discord GTA RP

Bot profissional para servidor Discord de GTA RP, focado em **recrutamento automatizado da facção** e **controle de farm semanal**, desenvolvido para rodar no **Vercel** usando **Discord Interactions API**.

---

## Módulos do bot

### 🏍️ Solicitar Set
Sistema de entrada de novos membros com:
- comando `/painel-set`
- botão `Solicitar Set`
- modal de cadastro
- aprovação, recusa e revisão pela staff
- alteração automática de nickname
- aplicação automática de cargos
- envio de DM ao usuário

### 📦 Farm
Sistema de acompanhamento semanal com:
- comando `/criarfarm`
- criação de canal privado `nome-id`
- meta semanal
- total entregue
- progresso automático
- observações
- reset semanal
- exclusão da aba com confirmação

---

## Stack

- Node.js 20+
- Express
- Discord Interactions API
- Vercel Serverless
- dotenv

---

## Estrutura

```text
bot-discord-gta-rp/
├── api/
│   └── interactions.js
├── scripts/
│   └── register-commands.js
├── src/
│   ├── app.js
│   ├── commands/
│   ├── interactions/
│   ├── services/
│   └── utils/
├── .env.example
├── package.json
├── vercel.json
└── README.md
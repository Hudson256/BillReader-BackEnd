# Configuração do BillReader-BackEnd

## Visão Geral

Este documento fornece instruções detalhadas para configurar e executar o BillReader-BackEnd. Siga cuidadosamente cada seção para garantir uma configuração adequada do sistema.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- Node.js (versão 14 ou superior)
- npm (geralmente vem com o Node.js)
- PostgreSQL (versão 12 ou superior)

## Instalação

1. Clone o repositório:

   ```git clone https://github.com/Hudson256/BillReader-BackEnd.git
   cd BillReader-BackEnd
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

## Configuração do Ambiente

1. Crie um arquivo `.env` na raiz do projeto.
2. Copie o conteúdo de `.env.example` para `.env`.
3. Preencha as variáveis de ambiente no arquivo `.env` conforme necessário.

Exemplo de `.env`:

## Variáveis de Ambiente

- `DATABASE_URL`: URL de conexão com o banco de dados
- `GEMINI_API_KEY`: Chave de API para o serviço Gemini
- `PORT`: Porta em que o servidor irá rodar (padrão: 3000)

## Banco de Dados

1. Certifique-se de que o PostgreSQL está instalado e em execução.
2. Crie um novo banco de dados para o BillReader:

   ```bash
   createdb billreader
   ```

3. Execute as migrações do banco de dados:

   ```bash
   npm run migrate
   ```

## Serviços Externos

### Configuração da Gemini API

1. Obtenha uma chave de API do serviço Gemini.
2. Adicione a chave ao arquivo `.env`:

   ```bash
   GEMINI_API_KEY=sua_chave_aqui
   ```

3. Configure o endpoint da API no arquivo `src/infrastructure/geminiApi.ts`.

## Logging

1. O sistema utiliza o Winston para logging.
2. Configure os níveis de log no arquivo `src/infrastructure/logger.ts`.
3. Os logs são salvos em `logs/app.log` por padrão.
4. Para ajustar as configurações de log, edite o arquivo `src/config/logging.ts`.

## Testes

1. Os testes utilizam Jest como framework.
2. Para executar todos os testes:

   ```bash
   npm test
   ```

3. Para executar testes específicos:

   ```bash
   npm test -- nome_do_arquivo_de_teste
   ```

4. Para executar testes com cobertura:

   ```bash
   npm run test:coverage
   ```

5. Os resultados da cobertura serão gerados na pasta `coverage/`.

Certifique-se de configurar um banco de dados de teste separado para os testes de integração.

## Docker

O projeto inclui um arquivo docker-compose.yml para facilitar a configuração do ambiente de desenvolvimento:

1. Certifique-se de ter o Docker e o Docker Compose instalados.
2. Execute o comando:

   ```bash
   docker-compose up -d
   ```

3. O servidor estará disponível na porta 3000 e o banco de dados PostgreSQL na porta 5432.

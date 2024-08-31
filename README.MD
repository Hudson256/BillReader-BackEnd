# BillReader-BackEnd

## Descrição

BillReader-BackEnd é um serviço para gerenciar medições de água e gás.

## Instalação

``` bash
 npm install 
 ```

## Configuração

Consulte o arquivo CONFIGURATION.md para instruções detalhadas de configuração.

## Uso

Para iniciar o servidor:

```bash
npm start
```

Para executar os testes:

``` bash
npm test
```

## Estrutura do Projeto

- `src/`: Código fonte
  - `application/`: Lógica de aplicação
  - `domain/`: Entidades e regras de negócio
  - `infrastructure/`: Implementações de infraestrutura
- `tests/`: Testes unitários e de integração

## API Endpoints

- POST /upload: Upload de uma nova medição
- PATCH /confirm: Confirmação de uma medição existente
- GET /<customer_code>/list: Listagem de medições de um cliente

Para detalhes completos da API, consulte o arquivo swagger.yaml.

## Tecnologias Utilizadas

- Node.js
- TypeScript
- Jest
- Express
- PostgreSQL
- Docker

## Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## Licença

Este projeto é licenciado sob a licença MIT.

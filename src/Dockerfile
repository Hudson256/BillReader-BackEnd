# Use a imagem base do Node.js
FROM node:18-alpine

# Define o diretório de trabalho na imagem
WORKDIR /usr/src/app

# Copia os arquivos de configuração e dependências
COPY package*.json ./
RUN npm install

# Copia o código-fonte da aplicação para o diretório de trabalho
COPY . .

# Compila o código TypeScript para JavaScript
RUN npm run build

# Expõe a porta em que a aplicação vai rodar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]

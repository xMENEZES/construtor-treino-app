🏋️ Construtor de Plano de Treino
Uma aplicação web full-stack que permite aos usuários criar, personalizar e exportar planos de treino detalhados. A aplicação conta com um sistema de autenticação seguro e um painel de aprovação de usuários para acesso controlado.

✨ Acesse a demonstração ao vivo aqui! ✨

🚀 Funcionalidades Principais
Construtor Dinâmico: Crie múltiplos dias de treino (Ex: Treino A, B, C).

Exercícios Detalhados: Adicione exercícios a cada dia com informações de séries, repetições, carga, descanso e mais.

Demonstrações em Vídeo: Incorpore vídeos do YouTube para cada exercício, facilitando a visualização da execução correta.

Exportação para HTML: Exporte o plano de treino completo como um único arquivo HTML interativo, com abas para cada dia de treino, ideal para visualização no celular.

Sistema de Autenticação Seguro: Cadastro e login de usuários utilizando e-mail e senha, gerenciado pelo Firebase Authentication.

Sistema de Aprovação de Usuários: Novos cadastros ficam com status "pendente" e precisam ser aprovados manualmente pelo administrador através do painel do Firestore, garantindo controle total sobre quem acessa a aplicação.

🛠️ Tecnologias Utilizadas
Front-End:

HTML5

Tailwind CSS

JavaScript (ES6+ Modules)

Back-End:

Node.js

Express.js

Serviços (BaaS - Backend as a Service):

Firebase Authentication: Para gerenciamento de identidade dos usuários (login/registro).

Cloud Firestore: Como banco de dados para armazenar informações e status dos usuários (pendente/aprovado).

Hospedagem:

Render (para o serviço Node.js)

🏛️ Arquitetura
O projeto utiliza uma arquitetura cliente-servidor para proteger a lógica de negócios e garantir a segurança.

Cliente (Front-End): A interface do usuário é uma Single-Page Application (SPA) construída com HTML, Tailwind CSS e JavaScript puro. Ela é responsável por capturar os dados do treino e interagir com o Firebase para autenticação.

Servidor (Back-End): Um servidor Node.js com Express expõe uma API RESTful.

/api/register: Endpoint que cria o usuário no Firebase Authentication e o salva no Firestore com status "pendente".

/api/generate-plan: Endpoint protegido que só pode ser acessado por usuários autenticados e com status "aprovado". Ele recebe os dados do treino e gera o arquivo HTML final.

Firebase: Atua como um serviço de backend para autenticação e banco de dados, simplificando o gerenciamento de usuários e permissões.

⚙️ Configuração para Desenvolvimento Local
Para rodar este projeto na sua máquina local, siga os passos abaixo:

Clone o repositório:

git clone [https://github.com/SEU_USUARIO/construtor-treino-app.git](https://github.com/SEU_USUARIO/construtor-treino-app.git)
cd construtor-treino-app

Instale as dependências:

npm install

Configure o Firebase:

Crie um projeto no console do Firebase.

Para o Front-End: Vá em "Configurações do Projeto" > "Geral", crie um App da Web e copie o objeto firebaseConfig. Cole essas chaves no arquivo public/index.html.

Para o Back-End: Vá em "Configurações do Projeto" > "Contas de serviço", clique em "Gerar nova chave privada" para baixar o seu arquivo de credenciais. Renomeie este arquivo para serviceAccountKey.json e coloque-o na raiz do projeto. Lembre-se que este arquivo está no .gitignore e não deve ser enviado para o repositório público.

Inicie o servidor:

node server.js

Abra http://localhost:3000 no seu navegador.

Licença
Este projeto é de propriedade de Gabriel Menezes. Todos os direitos reservados.

É estritamente proibida a redistribuição, cópia ou modificação do código sem a autorização expressa do autor.

const express = require('express');
const path = require('path');
const admin = require('firebase-admin');

// Cria a aplicação Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para o servidor entender JSON vindo no corpo das requisições
app.use(express.json());

// Serve os arquivos estáticos (nosso index.html) da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// ====================================================================
// =================== LÓGICA PROTEGIDA DA API ========================
// ====================================================================

// 1. A ROTA (O "PORTÃO DE ENTRADA" DA API)
//    Quando o front-end mandar uma requisição para '/api/generate-plan',
//    o código dentro deste bloco será executado.

// NOVO ENDPOINT PARA REGISTRO
app.post('/api/register', async (req, res) => {
    // Pega o e-mail e a senha que o front-end enviou
    const { email, password } = req.body;
    
    try {
        // 1. Usa o Firebase Admin para criar o usuário no sistema de Autenticação
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
        });

        // 2. Salva as informações desse novo usuário no banco de dados Firestore
        const db = admin.firestore();
        await db.collection('users').doc(userRecord.uid).set({
            email: userRecord.email,
            status: 'pendente', // O status inicial é sempre 'pendente'
            role: 'user',       // Um papel padrão
            createdAt: admin.firestore.FieldValue.serverTimestamp() // Salva a data de criação
        });

        // 3. Envia uma resposta de sucesso de volta para o front-end
        res.status(201).send({ message: 'Usuário registrado com sucesso! Aguardando aprovação do administrador.' });

    } catch (error) {
        // Se algo der errado (ex: e-mail já existe), envia uma mensagem de erro
        console.error('Erro no registro:', error);
        res.status(500).send({ message: 'Erro ao registrar usuário.', error: error.message });
    }
});

app.post('/api/generate-plan', (req, res) => {
    // Os dados do treino enviados pelo front-end chegam em req.body
    const workoutData = req.body;

    try {
        // 2. A CHAMADA DA FUNÇÃO
        //    Aqui nós chamamos a nossa função "secreta" para fazer o trabalho,
        //    passando os dados do treino que recebemos.
        const htmlContent = generateStaticHTMLFromServer(workoutData);
        
        // Enviamos o HTML gerado de volta para o front-end
        res.setHeader('Content-Type', 'text/html');
        res.send(htmlContent);

    } catch (error) {
        console.error("Erro ao gerar o plano:", error);
        res.status(500).send("Ocorreu um erro no servidor ao gerar seu plano.");
    }
});


// 3. A FUNÇÃO (A "FÁBRICA" DE HTML)
//    É AQUI QUE VOCÊ COLA A SUA LÓGICA. Esta função agora vive segura no servidor.
function generateStaticHTMLFromServer(workoutDivs) {
    let tabButtonsHTML = '';
    let tabContentsHTML = '';

    const getYoutubeEmbedUrl = (url) => {
        if (!url) return null; let videoId = '';
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname === 'youtu.be') videoId = urlObj.pathname.slice(1);
            else if (urlObj.hostname.includes('youtube.com')) videoId = urlObj.searchParams.get('v');
        } catch (e) { return null; }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    };

    (workoutDivs || []).forEach((workoutDiv, index) => {
        const workoutTitle = workoutDiv.title || 'Treino Sem Nome';
        const shortTitle = workoutTitle.split('–')[0].trim() || `Dia ${index + 1}`;
        const tabId = `workout-tab-${index}`;
        const titleParts = workoutTitle.split('–');
        const mainTitle = titleParts[0] ? titleParts[0].trim() : workoutTitle;
        const subtitle = titleParts[1] ? titleParts[1].trim() : '';
        let titleBlockHTML = `<div class="text-center mb-4"><h3 class="text-2xl font-bold text-white">${mainTitle}</h3>`;
        if (subtitle) titleBlockHTML += `<p class="text-lg text-slate-300">${subtitle}</p>`;
        titleBlockHTML += `</div>`;
        let exercisesHTML = '';
        (workoutDiv.exercises || []).forEach(item => {
            const exerciseName = item.name;
            const details = [
                { label: 'Séries', value: item.series }, { label: 'Reps', value: item.reps },
                { label: 'Range', value: item.range }, { label: 'Carga', value: item.carga },
                { label: 'Descanso', value: item.descanso },
            ].filter(d => d.value);
            const embedUrl = getYoutubeEmbedUrl(item.video);
            let detailsHTML = '';
            if (details.length > 0) {
                detailsHTML = '<div class="mt-2 space-y-1 text-sm">' + details.map(d => `<p><strong class="text-slate-300 font-semibold">${d.label}:</strong> ${d.value}</p>`).join('') + '</div>';
            }
            if (exerciseName) {
                exercisesHTML += `<li class="p-4 bg-card-light rounded-lg border border-gray-700"><div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start"><div class="md:col-span-2"><strong class="font-semibold text-lg text-white">${exerciseName}</strong>${detailsHTML}</div>${embedUrl ? `<div class="md:col-span-1"><div class="video-container"><iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe></div></div>` : ''}</div></li>`;
            }
        });
        if (exercisesHTML) {
            tabButtonsHTML += `<button data-tab="${tabId}" class="tab-link whitespace-nowrap px-4 py-2 text-sm font-medium rounded-md transition-colors">${shortTitle}</button>`;
            tabContentsHTML += `<div id="${tabId}" class="tab-content hidden"><div class="bg-card p-6 rounded-xl shadow-lg mb-6">${titleBlockHTML}<ul class="space-y-4">${exercisesHTML}</ul></div></div>`;
        }
    });

    // #######################################################################
    // ### IMPORTANTE: COLE AQUI A SUA STRING GIGANTE DO TEMPLATE HTML      ###
    // #######################################################################
    const template = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Meu Plano de Treino</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <style>
            body { font-family: 'Inter', sans-serif; background-color: #121212; color: #f1f5f9; }
            .video-container { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000; border-radius: 0.5rem; }
            .video-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
            .bg-card { background-color: rgba(42, 42, 45, 0.9); }
            .bg-card-light { background-color: rgba(62, 62, 65, 0.9); }
            .tab-link.active { background-color: #B81D24; color: #fff; }
            .tabs-container::-webkit-scrollbar { display: none; }
            .tabs-container { -ms-overflow-style: none;  scrollbar-width: none; }
        </style>
    </head>
    <body class="text-slate-100">
        <div class="container mx-auto p-4 sm:p-6 lg:p-8">
            <header class="text-center mb-8">
                <h1 class="text-4xl font-bold text-white">Meu Plano de Treino</h1>
                <p class="text-slate-400 mt-2">Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
            </header>
            <main>
                <div class="flex items-center justify-center mb-4 bg-card p-2 rounded-xl">
                    <button id="prev-tab" class="px-3 py-1 text-2xl font-bold hover:bg-gray-700 rounded-full">&lt;</button>
                    <div id="tabs-container" class="tabs-container flex-grow flex items-center space-x-2 overflow-x-auto scrolling-touch">
                        ${tabButtonsHTML}
                    </div>
                    <button id="next-tab" class="px-3 py-1 text-2xl font-bold hover:bg-gray-700 rounded-full">&gt;</button>
                </div>
                <div id="tabs-content-container">
                    ${tabContentsHTML}
                </div>
            </main>
        </div>
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                const tabsContainer = document.getElementById('tabs-container');
                const tabLinks = document.querySelectorAll('.tab-link');
                if (tabLinks.length === 0) return;
                const prevButton = document.getElementById('prev-tab');
                const nextButton = document.getElementById('next-tab');
                let activeTabIndex = 0;
                function showTab(index) {
                    tabLinks.forEach(link => link.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
                    tabLinks[index].classList.add('active');
                    document.getElementById(tabLinks[index].dataset.tab).classList.remove('hidden');
                    activeTabIndex = index;
                    tabsContainer.scrollTo({ left: tabLinks[index].offsetLeft - tabsContainer.offsetWidth / 2 + tabLinks[index].offsetWidth / 2, behavior: 'smooth' });
                }
                tabLinks.forEach((link, index) => link.addEventListener('click', () => showTab(index)));
                prevButton.addEventListener('click', () => showTab((activeTabIndex - 1 + tabLinks.length) % tabLinks.length));
                nextButton.addEventListener('click', () => showTab((activeTabIndex + 1) % tabLinks.length));
                showTab(0);
            });
        <\/script>
    </body>
    </html>
    `;

    return template;
}

// ====================================================================
// =================== FIM DA LÓGICA PROTEGIDA ========================
// ====================================================================


// Inicia o servidor para escutar na porta definida
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
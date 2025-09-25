const express = require('express');
const path = require('path');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- TESTE DE INICIALIZAÇÃO ---
let isFirebaseInitialized = false;

console.log("===> TENTANDO INICIALIZAR O FIREBASE ADMIN...");

try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  isFirebaseInitialized = true;
  console.log("===> SUCESSO: Firebase Admin foi inicializado.");
} catch (error) {
  console.error("===> ERRO CRÍTICO NA INICIALIZAÇÃO:", error);
}

// --- ROTAS DA API ---

app.post('/api/register', async (req, res) => {
  console.log('===> ROTA /api/register ACIONADA.');
  console.log('===> Status da inicialização do Firebase:', isFirebaseInitialized);

  if (!isFirebaseInitialized) {
    return res.status(500).json({ message: 'ERRO INTERNO NO SERVIDOR: O Firebase Admin não está inicializado.' });
  }

  const { email, password } = req.body;
  try {
    const userRecord = await admin.auth().createUser({ email, password });
    const db = admin.firestore();
    await db.collection('users').doc(userRecord.uid).set({
      email: userRecord.email,
      status: 'pendente',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.status(201).json({ message: 'Usuário registrado com sucesso! Aguardando aprovação.' });
  } catch (error) {
    console.error('===> ERRO DENTRO DA ROTA DE REGISTRO:', error);
    res.status(500).json({ message: 'Ocorreu um erro ao processar o registro.' });
  }
});

// Adicione sua rota /api/generate-plan e o middleware checkAuth aqui se precisar testá-los
// app.post('/api/generate-plan', checkAuth, (req, res) => { ... });

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
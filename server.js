require('dotenv').config(); // Carrega as variáveis de ambiente do .env
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');

// Import das configurações e rotas
const connectDB = require('./config/db'); // mongoose.connect(process.env.MONGO_URI)
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const postRoutes = require('./routes/postRoutes');
const contactRoutes = require('./routes/contactRoutes');
const verifyToken = require('./middlewares/verifyToken');
const carouselRoutes = require('./routes/carouselRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Conectar ao MongoDB
connectDB();

// 2. Middlewares globais
app.use(express.json());
app.use(helmet());

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100
});
app.use(limiter);

// 3. Upload de Imagens (Multer)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Somente arquivos de imagem são permitidos!'), false);
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// 4. Arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/imagens', express.static(path.join(__dirname, 'public/imagens')));

// 5. Rota de verificação básica
app.get('/', (req, res) => {
  res.send('🚀 Servidor está funcionando e conectado ao MongoDB!');
});

// Rota protegida de dashboard
app.get('/admin/dashboard', verifyToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'admin-dashboard.html'));
});

// 6. Upload de imagem com URL https forçada
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhuma imagem enviada!' });
  }

  const host = req.get('host').replace(/^http:/, 'https:'); // força https se necessário
  const imageUrl = `https://${host}/uploads/${req.file.filename}`;
  res.status(200).json({ imageUrl });
});

// 7. Rotas principais
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/carousel', carouselRoutes);

// 8. Rota 404
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada!' });
});

// 9. Tratamento de erro global
app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err.message);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

// 10. Inicializa o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

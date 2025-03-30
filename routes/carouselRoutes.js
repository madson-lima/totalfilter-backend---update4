const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const CarouselModel = require('../models/Carousel');

// ✅ ADICIONAR nova imagem ao carrossel
router.post('/', verifyToken, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ error: 'URL da imagem é obrigatória.' });

    const count = await CarouselModel.countDocuments();
    const novaImagem = await CarouselModel.create({
      imageUrl,
      position: count
    });

    res.status(201).json({ imageUrl: novaImagem.imageUrl });
  } catch (error) {
    console.error('Erro ao adicionar imagem ao carrossel:', error);
    res.status(500).json({ error: 'Erro ao adicionar imagem.' });
  }
});

// ✅ LISTAR todas as imagens ordenadas por posição
router.get('/', async (req, res) => {
  try {
    const imagens = await CarouselModel.find().sort({ position: 1 });
    res.json(imagens); // <-- envia como ARRAY de objetos
  } catch (error) {
    console.error('Erro ao buscar imagens do carrossel:', error);
    res.status(500).json({ error: 'Erro ao buscar imagens.' });
  }
});

// ✅ EXCLUIR imagem por ID
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await CarouselModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Imagem excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir imagem:', error);
    res.status(500).json({ error: 'Erro ao excluir imagem.' });
  }
});

// ✅ REORDENAR imagens
router.post('/reorder', verifyToken, async (req, res) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) {
      return res.status(400).json({ message: "Formato inválido." });
    }

    for (let i = 0; i < order.length; i++) {
      await CarouselModel.findByIdAndUpdate(order[i], { position: i });
    }

    res.status(200).json({ message: "Ordem atualizada com sucesso." });
  } catch (error) {
    console.error("Erro ao reordenar carrossel:", error);
    res.status(500).json({ message: "Erro interno ao reordenar." });
  }
});

module.exports = router;

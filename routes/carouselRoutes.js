const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const CarouselModel = require('../models/Carousel');

// POST /api/carousel -> Atualizar a imagem do carrossel
router.post('/', verifyToken, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    await CarouselModel.updateOne(
      {},
      { $set: { bannerUrl: imageUrl } },
      { upsert: true }
    );

    return res.status(200).json({ message: 'Carrossel atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar carrossel:', error);
    return res.status(500).json({ error: 'Erro ao atualizar carrossel.' });
  }
});

// GET /api/carousel -> Retorna o array de imagens (ou imagem única)
router.get('/', async (req, res) => {
  try {
    const doc = await CarouselModel.findOne({});
    if (!doc) {
      // Se não existir nenhum documento no banco
      return res.json({ images: [] });
    }
    // Se o carrossel tiver apenas uma imagem (bannerUrl),
    // criamos um array com esse valor
    res.json({ images: [ doc.bannerUrl ] });
  } catch (error) {
    console.error('Erro ao buscar carrossel:', error);
    return res.status(500).json({ error: 'Erro ao buscar carrossel.' });
  }
});

module.exports = router;

const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to Da Book Store API' });
}); 

router.use('/books', require('./bookRoutes'));
router.use('/audio-books', require('./audioRoutes'));
router.use('/orders', require('./orderRoutes'));
router.use('/user', require('./userRoutes'));


module.exports = router;
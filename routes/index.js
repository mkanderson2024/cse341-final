const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to Da Book Store API' });
}); 

router.use('/books', require('./bookRoutes'));
router.use('/audio', require('./audioRoutes'));
// router.use('/users', require('./userRoutes'));
// router.use('/orders', require('./orderRoutes'));


module.exports = router;
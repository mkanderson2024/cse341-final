const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');

// Get all orders route
router.get('/', orderController.getAllOrders);

// Get orders by ID route
router.get('/:orderId', orderController.getOrderById);

// Create new order route
router.post('/', orderController.createOrder);

// Edit order route
router.put('/:orderId', orderController.updateOrder);

// Delete order route
router.delete('/:orderId', orderController.deleteOrder);

module.exports = router;
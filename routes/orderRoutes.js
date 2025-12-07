const express = require('express');
const router = express.Router();
const {
    createOrderValidation,
    updateOrderValidation,
    orderIdValidation,
    userIdParamValidation,
    validate
    } = require('../validators/orderValidation')

const orderController = require('../controllers/orderController');

// Get all orders route
router.get('/', orderController.getAllOrders);

// Get orders by ID route
router.get('/:orderId', orderController.getOrderById);

// Create new order route
router.post('/', createOrderValidation, validate, orderController.createOrder);

// Edit order route
router.put('/:orderId', updateOrderValidation, validate, orderController.updateOrder);

// Delete order route
router.delete('/:orderId', orderController.deleteOrder);

module.exports = router;
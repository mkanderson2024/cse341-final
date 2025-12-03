const mongodb =  require('../config/db');
const { ObjectId } = require('mongodb');

const collectionName = 'orders';

// Get all orders (GET)
const getAllOrders = async (req,res) => {
    try{
        const db = mongodb.getDb()
        const orders = await db.collection(collectionName).find().toArray();
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error getting orders:", error);
        res.status(500).json({ message: "Server error getting orders."});
    }
};

// Get order by ID (GET/Id)
const getOrderById = async (req, res) => {
  try {
    const id = req.params.orderId;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID." });
    }

    const db = mongodb.getDb();
    const order = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error getting order by ID:", error);
    res.status(500).json({ message: "Internal server error getting order by Id." });
  }
};

// Create a new order (POST)
const createOrder = async (req,res) => {
    try{
        const { userId,
            shippingAddress,
            date,
            paymentMethod,
            trackingNumber,
            bookIds
        } = req.body

        const newOrder = {
            userId: new ObjectId(userId),
            shippingAddress,
            date: new Date(date),
            paymentMethod,
            trackingNumber: trackingNumber,
            bookIds: bookIds.map(id => new ObjectId(id))
        };

        const db = mongodb.getDb();
        const result = await db.collection(collectionName).insertOne(newOrder);

        res.status(201).json({
            message: "Order created successfully.",
            orderId: result.insertedId
        });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Internal server error while creating order"});
    }
};

// Update an order by ID (PUT)
const updateOrder = async (req, res) => {
  try {
    const id = req.params.orderId;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID." });
    }

    const { userId, shippingAddress, date, paymentMethod, trackingNumber, bookIds } = req.body;

    const updatedOrder = {
      userId: new ObjectId(userId),
      shippingAddress,
      date: new Date(date),
      paymentMethod,
      trackingNumber,
      bookIds: bookIds.map(orderId => new ObjectId(orderId))
    };

    const db = mongodb.getDb();
    const result = await db.collection(collectionName).updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedOrder }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.status(200).json({ message: "Order updated successfully." });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Internal server error while updating order." });
  }
};

// Delete Order by ID (DELETE)
const deleteOrder = async (req, res) => {
  try {
    const id = req.params.orderId;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID." });
    }

    const db = mongodb.getDb();
    const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.status(200).json({ message: "Order deleted successfully." });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder
};
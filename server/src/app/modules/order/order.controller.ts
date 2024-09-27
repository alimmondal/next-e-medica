import { Request, Response } from "express";
import { PrismaClient, Product } from "@prisma/client";
const prisma = new PrismaClient();
import {
  getOrderById,
  getMyOrders,
  getAllOrders,
  createOrder,
  updateOrderToPaid,
  deleteOrder,
  deliverOrder,
  createPayPalOrder,
  updateOrderToPaidByCOD,
  approvePayPalOrder,
} from "./orderService";

export const handleGetOrderById = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const order = await getOrderById(orderId);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

export const handleGetMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.userId; // assuming you extract userId from middleware
    const page = Number(req.query.page) || 1;
    const orders = await getMyOrders(userId, page);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user orders" });
  }
};

export const handleGetAllOrders = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const orders = await getAllOrders(page);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

export const handleCreateOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.userId; // assuming userId is extracted from middleware
    const newOrder = await createOrder(userId);
    res.json(newOrder);
  } catch (error) {
    res.status(500).json({ error: "Failed to create order" });
  }
};

export const handleUpdateOrderToPaid = async (req: Request, res: Response) => {
  try {
    const { orderId, paymentResult } = req.body;
    const updatedOrder = await updateOrderToPaid(orderId, paymentResult);
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: "Failed to update order as paid" });
  }
};

export const handleDeleteOrder = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    await deleteOrder(orderId);
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete order" });
  }
};

export const handleDeliverOrder = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const result = await deliverOrder(orderId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to mark order as delivered" });
  }
};

// Create a PayPal order
export const handleCreatePayPalOrder = async (req: Request, res: Response) => {
  try {
    const orderId = req.body.orderId;
    const paypalOrder = await createPayPalOrder(orderId);
    res.json(paypalOrder);
  } catch (error) {
    res.status(500).json({ error: "Failed to create PayPal order" });
  }
};

// Approve a PayPal order
export const handleApprovePayPalOrder = async (req: Request, res: Response) => {
  try {
    const { paypalOrderId, orderId } = req.body;
    const result = await approvePayPalOrder(paypalOrderId, orderId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to approve PayPal order" });
  }
};

// Mark order as paid by Cash on Delivery (COD)
export const handleUpdateOrderToPaidByCOD = async (
  req: Request,
  res: Response
) => {
  try {
    const orderId = req.params.id;
    const result = await updateOrderToPaidByCOD(orderId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to mark order as paid by COD" });
  }
};

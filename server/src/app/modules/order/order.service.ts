import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import { Prisma } from "@prisma/client";

// Fetch order by ID
export const getOrderById = async (orderId: string) => {
  return await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
};

// Fetch orders for the authenticated user
export const getMyOrders = async (userId: string, page: number) => {
  const PAGE_SIZE = 10;
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const totalOrders = await prisma.order.count({ where: { userId } });

  return {
    orders,
    totalPages: Math.ceil(totalOrders / PAGE_SIZE),
  };
};

// Fetch all orders
export const getAllOrders = async (page: number) => {
  const PAGE_SIZE = 10;
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      user: {
        select: { name: true },
      },
    },
  });

  const totalOrders = await prisma.order.count();

  return {
    orders,
    totalPages: Math.ceil(totalOrders / PAGE_SIZE),
  };
};

// Create a new order
export const createOrder = async (userId: string) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!cart || cart.items?.length === 0) throw new Error("Cart is empty");
  if (!user?.address) throw new Error("Shipping address is required");
  if (!user?.paymentMethod) throw new Error("Payment method is required");

  const newOrder = await prisma.$transaction(async (prisma) => {
    const order = await prisma.order.create({
      data: {
        userId,
        shippingAddress: user.address,
        paymentMethod: user.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
        orderItems: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            qty: item.qty,
            price: item.price,
          })),
        },
      },
    });

    await prisma.cart.update({
      where: { userId },
      data: {
        items: [],
        itemsPrice: 0,
        shippingPrice: 0,
        taxPrice: 0,
        totalPrice: 0,
      },
    });

    return order;
  });

  return newOrder;
};

// Update order status to paid
export const updateOrderToPaid = async (
  orderId: string,
  paymentResult: Prisma.JsonValue
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: true },
  });
  if (!order) throw new Error("Order not found");
  if (order.isPaid) throw new Error("Order already paid");

  await prisma.$transaction(async (prisma) => {
    for (const item of order.orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.qty,
          },
        },
      });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult,
      },
    });
  });

  return order;
};

// Create a PayPal order
export const createPayPalOrder = async (orderId: string) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");

  // Create PayPal order request (pseudo-code)
  const paypalOrder = {
    id: "PAYPAL_ORDER_ID", // This should come from PayPal's API response
    status: "CREATED",
  };

  return paypalOrder;
};

// Approve a PayPal order
export const approvePayPalOrder = async (
  paypalOrderId: string,
  orderId: string
) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");

  // Approve PayPal order (pseudo-code)
  const approvedOrder = {
    id: paypalOrderId,
    status: "APPROVED",
  };

  await prisma.order.update({
    where: { id: orderId },
    data: {
      isPaid: true,
      paidAt: new Date(),
      paymentResult: { paypalOrderId },
    },
  });

  return approvedOrder;
};

// Mark order as paid by Cash on Delivery (COD)
export const updateOrderToPaidByCOD = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: true },
  });
  if (!order) throw new Error("Order not found");
  if (order.isPaid) throw new Error("Order already paid");

  await prisma.$transaction(async (prisma) => {
    for (const item of order.orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.qty,
          },
        },
      });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult: { method: "COD" },
      },
    });
  });

  return order;
};

// Deliver order
export const deliverOrder = async (orderId: string) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  if (order.isDelivered) throw new Error("Order already delivered");

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      isDelivered: true,
      deliveredAt: new Date(),
    },
  });

  return updatedOrder;
};

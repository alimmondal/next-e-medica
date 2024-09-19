import { Request, Response } from "express";
import { PrismaClient, Product } from "@prisma/client";
import { calcPrice } from "../../../utils/calcPrice";

const prisma = new PrismaClient();

type CartItem = {
  productId: string;
  qty: number;
};
// Get Cart
const getMyCart = async (req: Request, res: Response) => {
  try {
    const sessionCartId = req.cookies.sessionCartId;
    const userId = req.user?.id;

    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionCartId },
    });

    res.json(cart || {});
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve cart" });
  }
};

// Add Item to Cart

const addItemToCart = async (req: Request, res: Response) => {
  try {
    const { items, userId } = req.body; // Extract items from request body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items are required" });
    }

    // const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    let updatedCart;
    // Iterate through items
    for (const item of items) {
      const { productId, qty } = item;

      if (!productId || !qty) {
        return res.status(400).json({
          error: "Product ID and quantity are required for all items",
        });
      }

      // Find the product in the database
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return res
          .status(404)
          .json({ error: `Product with ID ${productId} not found` });
      }

      if (product.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for product ID ${productId}`,
        });
      }

      // Find the cart by userId or sessionCartId
      let cart = await prisma.cart.findFirst({
        where: { userId },
      });

      let cartItems =
        (cart?.items as { productId: string; qty: number }[]) || [];

      const existingItem = cartItems.find(
        (cartItem) => cartItem.productId === productId
      );

      if (existingItem) {
        if (product.stock < existingItem.qty + qty) {
          return res
            .status(400)
            .json({ success: false, message: "Not enough stock" });
        }
        existingItem.qty += qty;
      } else {
        cartItems.push({ productId, qty });
      }

      // Calculate the prices
      const prices = calcPrice(cartItems);

      // Create or update the cart
      if (!cart) {
        updatedCart = await prisma.cart.create({
          data: {
            userId,
            items: cartItems,
            itemsPrice: prices.itemsPrice,
            shippingPrice: prices.shippingPrice,
            taxPrice: prices.taxPrice,
            totalPrice: prices.totalPrice,
          },
        });
      } else {
        updatedCart = await prisma.cart.update({
          where: { id: cart.id },
          data: {
            items: cartItems,
            itemsPrice: prices.itemsPrice,
            shippingPrice: prices.shippingPrice,
            taxPrice: prices.taxPrice,
            totalPrice: prices.totalPrice,
          },
        });
      }
    }

    res.json({
      success: true,
      cart: {
        ...updatedCart,
        itemsPrice: updatedCart?.itemsPrice.toFixed(2),
        shippingPrice: updatedCart?.shippingPrice.toFixed(2),
        taxPrice: updatedCart?.taxPrice.toFixed(2),
        totalPrice: updatedCart?.totalPrice.toFixed(2),
      },
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      error: error.message,
    });
  }
};

// Remove Item from Cart
const removeItemFromCart = async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;
    const sessionCartId = req.cookies.sessionCartId;
    const userId = req.user?.id;

    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionCartId },
    });

    if (!cart || !Array.isArray(cart.items))
      return res.status(404).json({ error: "Cart not found" });

    const existItem = cart.items.find(
      (item: any) => item.productId === productId
    );

    if (!existItem)
      return res.status(404).json({ error: "Item not found in cart" });

    cart.items = cart.items.filter((item: any) => item.productId !== productId);

    const updatedCart = await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items,
        ...calcPrice(cart.items),
      },
    });

    res.json({ success: true, cart: updatedCart });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const productController = {
  getMyCart,
  addItemToCart,
  removeItemFromCart,
};

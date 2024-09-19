import { Request, Response } from "express";
import { PrismaClient, Product } from "@prisma/client";
import { productService } from "./cart.service";
import { userService } from "../User/user.service";
import { calcPrice } from "../../../utils/calcPrice";

const prisma = new PrismaClient();
type CartItem = {
  productId: string;
  qty: number;
};

const addItemToCart = async (req: Request, res: Response) => {
  try {
    const { items } = req.body; // Extract items from request body

    // Ensure items array exists and is not empty
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items are required" });
    }

    const userId = req.user?.id;

    // Iterate through items to process each productId and qty
    let updatedCart;
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

      // Ensure there is enough stock
      if (product.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for product ID ${productId}`,
        });
      }

      // Find the cart by userId or sessionCartId
      let cart = await prisma.cart.findFirst({
        where: { userId: req.user?.id },
      });

      let cartItems =
        (cart?.items as { productId: string; qty: number }[]) || [];

      const existingItem = cartItems.find(
        (cartItem) => cartItem.productId === productId
      );

      if (existingItem) {
        // If item already exists, increase the quantity
        existingItem.qty += qty;
      } else {
        // If item doesn't exist, add a new item
        cartItems.push({ productId, qty });
      }

      // Create or update the cart with new items

      if (!cart) {
        // If no cart exists, create a new cart
        updatedCart = await prisma.cart.create({
          data: {
            userId,
            items: cartItems,
            ...calcPrice(cartItems),
          },
        });
      } else {
        // If cart exists, update the cart
        updatedCart = await prisma.cart.update({
          where: { id: cart.id },
          data: {
            items: cartItems,
            ...calcPrice(cartItems),
          },
        });
      }
    }

    res.json({
      success: true,
      cart: updatedCart,
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message,
    });
  }
};

const addItemToCarts = async (req: Request, res: Response) => {
  try {
    const { productId, qty, items } = req.body; // Extract productId and qty from request body
    console.log(items, "Cookie");
    // const sessionCartId = req.cookies.sessionCartId;
    const userId = req.user?.id;

    if (!productId || !qty) {
      return res
        .status(400)
        .json({ error: "Product ID and quantity are required" });
    }

    // Find the product in the database
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Find the cart by userId or sessionCartId
    const cart = await prisma.cart.findFirst({
      where: { userId: req.user?.id },
    });

    // Handle the case where cart or cart.items is null or not an array
    if (!cart || !Array.isArray(cart.items)) {
      throw new Error("Cart not found or items are not in the correct format.");
    }

    // Cast cart.items to the expected structure (array of objects with productId and qty)
    const cartItems = cart.items as { productId: string; qty: number }[];

    let updatedCart;

    if (!cart || !Array.isArray(cart.items)) {
      // If no cart exists, create a new cart with the item

      const items = [{ productId, qty }]; // Add item with productId and qty

      if (product.stock < qty) {
        return res
          .status(400)
          .json({ success: false, message: "Not enough stock" });
      }
      updatedCart = await prisma.cart.create({
        data: {
          userId,
          // sessionCartId,
          items: items, // Save items as JSON
          ...calcPrice(items),
        },
      });
    } else {
      // If cart exists, update the items array
      // const cartItems = cart.items as { productId: string; qty: number }[];

      const existItem = cartItems.find(
        (item: any) => item.productId === productId
      );

      if (existItem) {
        // If item already exists, increase the quantity
        if (product.stock < existItem.qty + qty) {
          return res
            .status(400)
            .json({ success: false, message: "Not enough stock" });
        }
        existItem.qty += qty;
      } else {
        // If item doesn't exist, add a new item
        cart.items.push({ productId, qty });
      }

      updatedCart = await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items, // Update items array
          ...calcPrice(cart.items), // Recalculate the prices
        },
      });
    }

    res.json({
      success: true,
      cart: updatedCart,
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message,
    });
  }
};

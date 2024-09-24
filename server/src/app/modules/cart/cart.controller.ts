import { Request, Response } from "express";
import { PrismaClient, Product } from "@prisma/client";
import { calcPrice } from "../../../utils/calcPrice";
import { cartService } from "./cart.service";

const prisma = new PrismaClient();

type CartItem = {
  productId: string;
  qty: number;
};

// Get Cart
const getMyCart = async (req: Request, res: Response) => {
  try {
    const sessionCartId = req.cookies.sessionCartId;
    // console.log(sessionCartId);

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
    const userId = req.user?.id;
    // const { items } = req.body; // Extract items from request body

    const updatedCart = await cartService.addItemToCart(userId, req.body);

    const sessionCartId = updatedCart.sessionCartId;
    res.cookie("sessionCartId", sessionCartId, {
      httpOnly: true,
      secure: false,
    });

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
    console.error(error, "Cart Error");
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

import { Request, Response } from "express";
import { cartService } from "./cart.service";

// Get Cart
const getMyCart = async (req: Request, res: Response) => {
  try {
    const sessionCartId = req.cookies.sessionCartId;
    // console.log(sessionCartId);
    const userId = req.user?.id;

    const cart = await cartService.getMyCart(sessionCartId, userId);

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

    const updatedCart = await cartService.removeItemFromCart(
      userId,
      sessionCartId,
      req.body
    );

    res.json({
      success: true,
      cart: updatedCart,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const productController = {
  getMyCart,
  addItemToCart,
  removeItemFromCart,
};

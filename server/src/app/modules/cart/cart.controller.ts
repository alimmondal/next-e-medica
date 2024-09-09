import { Request, Response } from "express";
import { PrismaClient, Product } from "@prisma/client";
import { productService } from "./cart.service";
import { userService } from "../User/user.service";
import { calcPrice } from "../../../utils/calcPrice";

const prisma = new PrismaClient();

// Get Cart
export const getMyCart = async (req: Request, res: Response) => {
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
export const addItemToCart = async (req: Request, res: Response) => {
  try {
    const { productId, qty } = req.body;
    const sessionCartId = req.cookies.sessionCartId;
    const userId = req.user?.id;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) return res.status(404).json({ error: "Product not found" });

    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionCartId },
    });

    let updatedCart;
    if (!cart) {
      if (product.stock < 1) throw new Error("Not enough stock");

      const items = [{ productId, qty }];
      updatedCart = await prisma.cart.create({
        data: {
          userId,
          sessionCartId,
          items: items,
          ...calcPrice(items),
        },
      });
    } else {
      const existItem = cart.items.find(
        (item: any) => item.productId === productId
      );

      if (existItem) {
        if (product.stock < existItem.qty + qty)
          throw new Error("Not enough stock");

        existItem.qty += qty;
      } else {
        if (product.stock < 1) throw new Error("Not enough stock");

        cart.items.push({ productId, qty });
      }

      updatedCart = await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items,
          ...calcPrice(cart.items),
        },
      });
    }

    res.json({
      success: true,
      cart: updatedCart,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Remove Item from Cart
export const removeItemFromCart = async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;
    const sessionCartId = req.cookies.sessionCartId;
    const userId = req.user?.id;

    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionCartId },
    });

    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const existItem = cart.items.find(
      (item: CartItem) => item.productId === productId
    );

    if (!existItem)
      return res.status(404).json({ error: "Item not found in cart" });

    cart.items = cart.items.filter(
      (item: CartItem) => item.productId !== productId
    );

    const updatedCart = await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items,
        ...calcPrice(cart.items),
      },
    });

    res.json({ success: true, cart: updatedCart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CREATE Product
const createProduct = async (req: Request, res: Response) => {
  try {
    const product: Product = await productService.createProduct(req.body);
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// READ all products with optional filters and pagination
const getAllProducts = async (req: Request, res: Response) => {
  try {
    const result = await productService.getAllProducts(req.query);

    res.json({
      success: true,
      data: result.products,
      totalPages: result.totalPages,
      totalCount: result.totalCount,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// READ Product by ID
const getProductById = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const product = await productService.getProductById(productId);

    res.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE Product
const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body);

    res.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE Product
const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    await productService.deleteProduct(id);
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const productController = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};

import { Request, Response } from "express";
import { PrismaClient, Product } from "@prisma/client";
import { productService } from "./product.service";
import { userService } from "../User/user.service";

const prisma = new PrismaClient();

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

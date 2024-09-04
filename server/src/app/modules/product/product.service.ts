import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const createProduct = async (data: any): Promise<any> => {
  const product = await prisma.product.create({
    data,
  });
};

const getAllProducts = async (data: any): Promise<any> => {
  const { query, limit = 10, page = 1, category, price, rating, sort } = data;

  const filters: any = {
    ...(query && { name: { contains: query, mode: "insensitive" } }),
    ...(category && { category }),
    ...(rating && { rating: { gte: parseFloat(rating) } }),
    ...(price && {
      price: {
        gte: parseFloat(price.split("-")[0]),
        lte: parseFloat(price.split("-")[1]),
      },
    }),
  };

  const orderBy: any = {
    ...(sort === "lowest" && { price: "asc" }),
    ...(sort === "highest" && { price: "desc" }),
    ...(sort === "rating" && { rating: "desc" }),
    ...(sort === "newest" && { createdAt: "desc" }),
  };

  const products = await prisma.product.findMany({
    where: filters,
    orderBy,
    skip: (parseInt(page) - 1) * parseInt(limit),
    take: parseInt(limit),
  });

  const totalCount = await prisma.product.count({ where: filters });
  const totalPages = Math.ceil(totalCount / parseInt(limit));
  return { products, totalPages };
};

const getProductById = async (data: any): Promise<any> => {
  const product = await prisma.product.findUnique({
    where: { id: data },
  });

  if (!product) throw new Error("Product not found");

  return product;
};

const updateProduct = async (id: string, data: any) => {
  const { products } = data;

  const product = await prisma.product.update({
    where: { id },
    data: products,
  });

  return product;
};

const deleteProduct = async (data: any) => {
  const { id, ...products } = data;

  const product = await prisma.product.update({
    where: { id },
    data: products,
  });

  return product;
};

export const productService = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
};

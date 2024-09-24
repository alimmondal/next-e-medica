import { PrismaClient } from "@prisma/client";
import { calcPrice } from "../../../utils/calcPrice";
const prisma = new PrismaClient();

const addItemToCart = async (userId: any, data: any): Promise<any> => {
  const { items, sessionCartId } = data;
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Items are required");
  }

  let updatedCart;

  // Validate items and check stock (as previously implemented)
  for (const item of items) {
    const { productId, qty } = item;

    if (!productId || !qty) {
      throw new Error("Product ID and quantity are required for all items");
    }

    // Find the product in the database
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    if (product.stock < qty) {
      throw new Error(`Not enough stock for product ID ${productId}`);
    }

    // Find the cart by userId or sessionCartId
    let cart = await prisma.cart.findFirst({
      where: { userId },
    });

    let cartItems =
      (cart?.items as { productId: string; qty: number; price: number }[]) ||
      [];

    const existingItem = cartItems.find(
      (cartItem) => cartItem.productId === productId
    );

    if (existingItem) {
      if (product.stock < existingItem.qty + qty) {
        throw new Error("Not enough stock");
      }
      existingItem.qty += qty;
    } else {
      cartItems.push({ productId, qty, price: product.price });
    }

    // Calculate the prices
    const prices = calcPrice(cartItems);

    // Ensure prices are valid
    if (
      isNaN(prices.itemsPrice) ||
      isNaN(prices.shippingPrice) ||
      isNaN(prices.taxPrice) ||
      isNaN(prices.totalPrice)
    ) {
      throw new Error("Invalid price calculations");
    }

    // Create or update the cart
    if (!cart) {
      updatedCart = await prisma.cart.create({
        data: {
          user: { connect: { id: userId } }, // Use the user relation here
          sessionCartId: sessionCartId,
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
  return updatedCart;
};

const getMyCart = async (data: any): Promise<any> => {
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
  return { products, totalPages, totalCount };
};

const removeItemFromCart = async (id: any) => {
  const product = await prisma.product.delete({
    where: { id },
  });

  return product;
};

export const cartService = {
  addItemToCart,
  getMyCart,
  removeItemFromCart,
};

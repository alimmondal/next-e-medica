import { Cart, PrismaClient } from "@prisma/client";
import { calcPrice } from "../../../utils/calcPrice";
const prisma = new PrismaClient();

const getMyCart = async (
  sessionCartId: string,
  userId: string
): Promise<any> => {
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionCartId },
  });
  return cart;
};

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

const removeItemFromCart = async (
  userId: any,
  sessionCartId: string,
  data: any
) => {
  const { productId } = data;
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionCartId },
  });

  if (!cart || !Array.isArray(cart.items)) throw new Error("Cart not found");

  const existItem = cart.items.find(
    (item: any) => item.productId === productId
  );

  if (!existItem) throw new Error("Item not found in cart");

  cart.items = cart.items.filter((item: any) => item.productId !== productId);

  const updatedCart = await prisma.cart.update({
    where: { id: cart.id },
    data: {
      items: cart.items,
      ...calcPrice(cart.items),
    },
  });

  return updatedCart;
};

export const cartService = {
  addItemToCart,
  getMyCart,
  removeItemFromCart,
};

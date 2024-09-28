import { PrismaClient, Review } from "@prisma/client";
import { calcPrice } from "../../../utils/calcPrice";
const prisma = new PrismaClient();

const createReview = async (data: Review, userId: string): Promise<any> => {
  const { productId, rating, title, description } = data;

  // console.log(productId);

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  // console.log(product, "product");
  if (!product) {
    throw new Error("Product not found");
  }

  // Check if review already exists
  const existingReview = await prisma.review.findFirst({
    where: {
      productId,
      userId,
    },
  });

  let review;
  if (existingReview) {
    // Update the existing review
    review = await prisma.review.update({
      where: { id: existingReview.id },
      data: {
        rating,
        title,
        description,
      },
    });
  } else {
    // Create a new review
    review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating,
        title,
        description,
      },
    });
  }

  // Update product rating and number of reviews
  const reviews = await prisma.review.findMany({
    where: { productId },
  });

  const numReviews = reviews.length;
  const avgRating =
    reviews.reduce((acc, review) => acc + review.rating, 0) / numReviews;

  await prisma.product.update({
    where: { id: productId },
    data: {
      numReviews,
      rating: avgRating,
    },
  });
  // Return the updated review and product stats
  return {
    review,
    productRating: avgRating,
    numReviews,
  };
};

const getReviews = async (productId: string, data: any): Promise<any> => {
  const { page = 1, limit = 10 } = data;

  const reviews = await prisma.review.findMany({
    where: { productId },
    include: {
      user: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
  });

  const totalCount = await prisma.review.count({
    where: { productId },
  });

  return {
    totalCount,
    reviews,
  };
};

const getUserReviewByProductId = async (userId: any, productId: string) => {
  const review = await prisma.review.findFirst({
    where: {
      productId,
      userId,
    },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  return review;
};

export const reviewService = {
  createReview,
  getReviews,
  getUserReviewByProductId,
};

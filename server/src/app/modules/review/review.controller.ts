import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

const createUpdateReview = async (req: Request, res: Response) => {
  try {
    const { productId, rating, title, description } = req.body;
    const userId = req.user?.id; // Assuming you have `req.user` populated via some middleware after authentication.

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if review already exists
    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        userId,
      },
    });

    if (existingReview) {
      // Update the existing review
      await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          title,
          description,
        },
      });
    } else {
      // Create a new review
      await prisma.review.create({
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

    return res.status(200).json({ message: "Review updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

const getReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

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

    return res.status(200).json({
      data: reviews,
      totalPages: Math.ceil(totalCount / Number(limit)),
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const getUserReviewByProductId = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.id; // Assuming `req.user` is available via authentication middleware

    const review = await prisma.review.findFirst({
      where: {
        productId,
        userId,
      },
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.status(200).json(review);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const reviewController = {
  createUpdateReview,
  getUserReviewByProductId,
  getReviews,
};

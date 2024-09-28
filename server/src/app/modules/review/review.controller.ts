import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { reviewService } from "./review.service";

const prisma = new PrismaClient();

// create review
const createUpdateReview = async (req: Request, res: Response) => {
  try {
    const { productId, rating, title, description } = req.body;
    const userId = req.user?.id;

    const result = await reviewService.createReview(req.body, userId);

    res.status(200).json({
      message: "Review updated successfully",
      data: result,
    });
  } catch (error: any) {
    // console.log(error.message);
    res.status(500).json({
      message: error.message,
      error,
    });
  }
};

const getReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await reviewService.getReviews(productId, req.query);
    const { reviews, totalCount } = result;

    res.status(200).json({
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

    const review = await reviewService.getUserReviewByProductId(
      userId,
      productId
    );

    res.status(200).json({
      message: "review successfully retrieved",
      data: review,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
      error,
    });
  }
};

export const reviewController = {
  createUpdateReview,
  getUserReviewByProductId,
  getReviews,
};

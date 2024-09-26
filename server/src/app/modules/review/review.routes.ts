import express from "express";
import { authMiddleware } from "../../helpers/jwtHelper";
import { reviewController } from "./review.controller";
const router = express.Router();

router.post("/", authMiddleware, reviewController.createUpdateReview);

// Get
router.get("/", authMiddleware, reviewController.getReviews);
router.get("/:id", reviewController.getUserReviewByProductId);
// delete

export const ReviewRoutes = router;

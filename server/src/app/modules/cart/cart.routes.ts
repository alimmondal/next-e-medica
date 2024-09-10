import express from "express";
import { productController } from "./cart.controller";
const router = express.Router();

router.post("/", productController.addItemToCart);

// Get
router.get("/", productController.getMyCart);
router.get("/:productId", productController.removeItemFromCart);
// delete

export const ProductRoute = router;

import express from "express";
import { productController } from "./cart.controller";
const router = express.Router();

router.post("/", productController.addItemToCart);

// Get
router.get("/", productController.getMyCart);
router.delete("/:id", productController.removeItemFromCart);
// delete

export const CartRoutes = router;

import express from "express";
import { productController } from "./cart.controller";
import { authMiddleware } from "../../helpers/jwtHelper";
const router = express.Router();

router.post("/", authMiddleware, productController.addItemToCart);

// Get
router.get("/", authMiddleware, productController.getMyCart);
router.post("/remove", productController.removeItemFromCart);
// delete

export const CartRoutes = router;

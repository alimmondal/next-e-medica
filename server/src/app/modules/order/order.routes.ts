import express from "express";
import { productController } from "./order.controller";
const router = express.Router();

router.post("/");

// Get
router.get("/");
router.get("/:productId");
// delete
router.delete("/:id");

// update
router.patch("/:id");
// router.patch("/address", productController.updateUserAddress);
// router.patch("/payment-method", productController.updateUserPaymentMethod);

export const OrderRoute = router;

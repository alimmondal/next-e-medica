import express from "express";
import { productController } from "./product.controller";
const router = express.Router();

router.post("/", productController.createProduct);

// Get
router.get("/", productController.getAllProducts);
router.get("/:productId", productController.getProductById);
// delete
router.delete("/:id", productController.deleteProduct);

// update
router.patch("/:id", productController.updateProduct);
// router.patch("/address", productController.updateUserAddress);
// router.patch("/payment-method", productController.updateUserPaymentMethod);

export const ProductRoute = router;

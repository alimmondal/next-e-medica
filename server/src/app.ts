import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Application } from "express";
import { UserRoutes } from "./app/modules/User/user.routes";
import { ProductRoute } from "./app/modules/product/product.routes";
import { CartRoutes } from "./app/modules/cart/cart.routes";
import { ReviewRoutes } from "./app/modules/review/review.routes";

const app: Application = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send({ message: "Hello health care server" });
});

app.use("/api/v1/user", UserRoutes);
app.use("/api/v1/product", ProductRoute);
app.use("/api/v1/cart", CartRoutes);
app.use("/api/v1/review", ReviewRoutes);

export default app;

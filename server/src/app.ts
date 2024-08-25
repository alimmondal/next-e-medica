import express, { Request, Response } from "express";
import cors from "cors";
import { Application } from "express";
import { UserRoutes } from "./app/modules/User/user.routes";

const app: Application = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send({ message: "Hello health care server" });
});

app.use("/api/v1/user", UserRoutes);

export default app;

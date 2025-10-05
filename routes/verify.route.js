import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = Router();

router.get("/protected",verifyJWT,(req, res) => {
    res.json({ message: 'Access granted', user: req.user });
  });

  export default router;
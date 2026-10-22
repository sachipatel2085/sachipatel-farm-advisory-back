import express from "express";
import {
  getCommunityPosts,
  getPostById,
  createPost,
  toggleLikePost,
  addComment,
  toggleLikeComment,
  markAcceptedSolution,
  deletePost,
  getCommunityMeta,
} from "../controllers/communityController.js";
import { protect, optionalProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/posts", optionalProtect, getCommunityPosts);
router.get("/posts/:id", optionalProtect, getPostById);
router.get("/meta", getCommunityMeta);

router.post("/posts", protect, createPost);
router.post("/posts/:id/like", protect, toggleLikePost);
router.post("/posts/:id/comments", protect, addComment);
router.post("/comments/:commentId/like", protect, toggleLikeComment);
router.patch("/posts/:id/solution/:commentId", protect, markAcceptedSolution);
router.delete("/posts/:id", protect, deletePost);

export default router;

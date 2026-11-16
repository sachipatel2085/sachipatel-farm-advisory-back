import CommunityPost from "../models/CommunityPost.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import { generateUniqueSlug, buildIdOrSlugQuery } from "../utils/slugify.js";

/* Auto-seed initial community discussions if empty */
export const seedInitialCommunityDiscussions = async () => {
  try {
    const count = await CommunityPost.countDocuments();
    if (count > 0) return;

    // Find or create a designated agronomy expert user
    let expertUser = await User.findOne({ role: "expert" });
    if (!expertUser) {
      expertUser = await User.findOne({ role: "admin" });
    }

    if (!expertUser) {
      expertUser = await User.findOne();
    }

    if (!expertUser) return;

    // Post 1: Tomato Whitefly & Early Blight (Solved with Expert Answer)
    const post1 = await CommunityPost.create({
      author: expertUser._id,
      title: "Tomato 42-day: Yellow leaf curling & dark concentric spots on lower leaves",
      slug: await generateUniqueSlug(CommunityPost, "Tomato 42-day Yellow leaf curling dark concentric spots"),
      content:
        "My hybrid tomatoes are in the 6th week after transplanting. I noticed tiny white flies flying when shaking the plants, and the bottom leaves have dark circular rings. Is this early blight, and what is the best tank-mix spray that won't cause blossom drop?",
      category: "pest_disease",
      cropTag: "Tomato",
      views: 142,
      pinned: true,
      isSolved: true,
      commentCount: 2,
    });

    const comment1 = await Comment.create({
      post: post1._id,
      author: expertUser._id,
      content:
        "This is a classic dual issue: 1) Sucking Whitefly (Bemisia tabaci) which transmits Leaf Curl Virus, and 2) Early Blight (Alternaria solani). For immediate remediation, tank mix: Acetamiprid 20% SP @ 0.5g/L + Mancozeb 75% WP @ 2.5g/L with a wetting sticker. Spray in early morning covering the underside of lower leaves. Avoid overhead sprinkler irrigation as wet foliage accelerates fungal sporulation.",
      isExpertAnswer: true,
      isAcceptedSolution: true,
      likes: [expertUser._id],
    });

    post1.solvedByComment = comment1._id;
    await post1.save();

    // Post 2: Wheat Crown Root Initiation (CRI)
    await CommunityPost.create({
      author: expertUser._id,
      title: "Wheat CRI Stage Irrigation: How strictly must the 21-day window be followed?",
      slug: await generateUniqueSlug(CommunityPost, "Wheat CRI Stage Irrigation 21-day window"),
      content:
        "I sowed HD-2967 wheat 18 days ago in sandy loam soil. The soil surface looks dry but sub-surface has some moisture. Should I irrigate right on Day 21 or can I wait for 28 days? Also, should I broadcast Urea before or after watering?",
      category: "irrigation",
      cropTag: "Wheat",
      views: 89,
      commentCount: 1,
    });

    // Post 3: Pink Bollworm in Cotton
    await CommunityPost.create({
      author: expertUser._id,
      title: "Pink Bollworm prevention in Cotton: Pheromone trap density per acre",
      slug: await generateUniqueSlug(CommunityPost, "Pink Bollworm prevention Cotton pheromone trap density"),
      content:
        "With heavy pink bollworm reports in neighboring districts, I want to install funnel pheromone traps for monitoring. How many traps per acre are recommended for mass trapping vs scouting, and when should the lures be replaced?",
      category: "pest_disease",
      cropTag: "Cotton",
      views: 110,
      commentCount: 1,
    });

    console.log("Successfully seeded initial community discussions.");
  } catch (err) {
    console.warn("seedInitialCommunityDiscussions error:", err.message);
  }
};

/* Get all community posts with filtering, search, pagination, and sorting */
export const getCommunityPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      cropTag,
      q,
      sort = "latest",
      filter,
    } = req.query;

    const query = {};

    if (category && category !== "all") {
      query.category = category;
    }

    if (cropTag && cropTag !== "all") {
      query.cropTag = new RegExp(`^${cropTag.trim()}$`, "i");
    }

    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), "i");
      query.$or = [{ title: searchRegex }, { content: searchRegex }, { cropTag: searchRegex }];
    }

    if (filter === "solved") {
      query.isSolved = true;
    } else if (filter === "unanswered") {
      query.commentCount = 0;
    }

    let sortOption = { pinned: -1, createdAt: -1 };
    if (sort === "popular") {
      sortOption = { pinned: -1, commentCount: -1, views: -1 };
    } else if (sort === "views") {
      sortOption = { pinned: -1, views: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [posts, total] = await Promise.all([
      CommunityPost.find(query)
        .populate("author", "name role profileImage location")
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      CommunityPost.countDocuments(query),
    ]);

    // Attach like status for current user if logged in
    const currentUserId = req.user?._id?.toString();
    const enriched = posts.map((p) => ({
      ...p,
      likeCount: (p.likes || []).length,
      hasLiked: currentUserId ? (p.likes || []).some((id) => id.toString() === currentUserId) : false,
    }));

    res.json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      posts: enriched,
    });
  } catch (error) {
    console.error("getCommunityPosts error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Rate-limit view increments to avoid duplicate counting (React StrictMode, double clicks, rapid refreshes)
const recentPostViews = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of recentPostViews.entries()) {
    if (now - timestamp > 60000) {
      recentPostViews.delete(key);
    }
  }
}, 60000).unref();

/* Get single discussion post with comments & increment views */
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const { skipView } = req.query;

    const visitorId =
      req.user?._id?.toString() ||
      req.headers["x-forwarded-for"] ||
      req.socket?.remoteAddress ||
      "visitor";
    const cacheKey = `${visitorId}:${id}`;
    const now = Date.now();
    const lastViewedAt = recentPostViews.get(cacheKey);

    // Throttle view increments to once per 15 seconds per visitor per post
    const shouldIncrementView =
      skipView !== "true" &&
      (!lastViewedAt || now - lastViewedAt > 15000);

    const query = buildIdOrSlugQuery(id);

    let post;
    if (shouldIncrementView) {
      recentPostViews.set(cacheKey, now);
      post = await CommunityPost.findOneAndUpdate(
        query,
        { $inc: { views: 1 } },
        { returnDocument: 'after' }
      )
        .populate("author", "name role profileImage location")
        .populate("solvedByComment")
        .lean();
    } else {
      post = await CommunityPost.findOne(query)
        .populate("author", "name role profileImage location")
        .populate("solvedByComment")
        .lean();
    }

    if (!post) {
      return res.status(404).json({ message: "Discussion post not found" });
    }

    const comments = await Comment.find({ post: post._id })
      .populate("author", "name role profileImage location")
      .sort({ isAcceptedSolution: -1, isExpertAnswer: -1, createdAt: 1 })
      .lean();

    const currentUserId = req.user?._id?.toString();

    const enrichedComments = comments.map((c) => ({
      ...c,
      likeCount: (c.likes || []).length,
      hasLiked: currentUserId ? (c.likes || []).some((uid) => uid.toString() === currentUserId) : false,
    }));

    res.json({
      post: {
        ...post,
        likeCount: (post.likes || []).length,
        hasLiked: currentUserId ? (post.likes || []).some((uid) => uid.toString() === currentUserId) : false,
      },
      comments: enrichedComments,
    });
  } catch (error) {
    console.error("getPostById error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* Create a new discussion post */
export const createPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, content, category, cropTag, images } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required." });
    }

    const slug = await generateUniqueSlug(CommunityPost, title);

    const post = await CommunityPost.create({
      author: userId,
      title: title.trim(),
      slug,
      content: content.trim(),
      category: category || "general",
      cropTag: cropTag ? cropTag.trim() : "General",
      images: Array.isArray(images) ? images : [],
    });

    const populated = await CommunityPost.findById(post._id)
      .populate("author", "name role profileImage location")
      .lean();

    res.status(201).json({
      message: "Discussion post published successfully",
      post: {
        ...populated,
        likeCount: 0,
        hasLiked: false,
      },
    });
  } catch (error) {
    console.error("createPost error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* Like / Unlike a post */
export const toggleLikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const post = await CommunityPost.findOne(buildIdOrSlugQuery(id));
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const index = post.likes.indexOf(userId);
    let hasLiked = false;

    if (index > -1) {
      post.likes.splice(index, 1);
      hasLiked = false;
    } else {
      post.likes.push(userId);
      hasLiked = true;
    }

    await post.save();

    res.json({
      hasLiked,
      likeCount: post.likes.length,
    });
  } catch (error) {
    console.error("toggleLikePost error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* Add a comment / answer to a post */
export const addComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role || "farmer";
    const { id } = req.params;
    const { content, images } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment content cannot be empty." });
    }

    const post = await CommunityPost.findOne(buildIdOrSlugQuery(id));
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Role-based verification: if user is expert or admin, flag as expert answer!
    const isExpertAnswer = userRole === "expert" || userRole === "admin";

    const comment = await Comment.create({
      post: post._id,
      author: userId,
      content: content.trim(),
      images: Array.isArray(images) ? images : [],
      isExpertAnswer,
    });

    post.commentCount = (post.commentCount || 0) + 1;
    await post.save();

    const populated = await Comment.findById(comment._id)
      .populate("author", "name role profileImage location")
      .lean();

    res.status(201).json({
      message: "Answer submitted successfully",
      comment: {
        ...populated,
        likeCount: 0,
        hasLiked: false,
      },
    });
  } catch (error) {
    console.error("addComment error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* Like / Unlike a comment */
export const toggleLikeComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const index = comment.likes.indexOf(userId);
    let hasLiked = false;

    if (index > -1) {
      comment.likes.splice(index, 1);
      hasLiked = false;
    } else {
      comment.likes.push(userId);
      hasLiked = true;
    }

    await comment.save();

    res.json({
      hasLiked,
      likeCount: comment.likes.length,
    });
  } catch (error) {
    console.error("toggleLikeComment error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* Mark comment as accepted solution */
export const markAcceptedSolution = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { id, commentId } = req.params;

    const post = await CommunityPost.findOne(buildIdOrSlugQuery(id));
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Only post author or admin/moderator can mark accepted solution
    if (post.author.toString() !== userId.toString() && userRole !== "admin" && userRole !== "moderator") {
      return res.status(403).json({ message: "Not authorized to accept solution for this post" });
    }

    // Reset previous solutions on this post
    await Comment.updateMany({ post: post._id }, { isAcceptedSolution: false });

    // Mark target comment
    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { isAcceptedSolution: true },
      { returnDocument: 'after' }
    );

    post.isSolved = true;
    post.solvedByComment = commentId;
    await post.save();

    res.json({
      message: "Comment accepted as solution",
      commentId,
      isSolved: true,
    });
  } catch (error) {
    console.error("markAcceptedSolution error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* Delete post */
export const deletePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { id } = req.params;

    const post = await CommunityPost.findOne(buildIdOrSlugQuery(id));
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== userId.toString() && userRole !== "admin" && userRole !== "moderator") {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await Promise.all([
      CommunityPost.deleteOne({ _id: post._id }),
      Comment.deleteMany({ post: post._id }),
    ]);

    res.json({ message: "Post deleted successfully", id: post._id, slug: post.slug });
  } catch (error) {
    console.error("deletePost error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* Get distinct crop tags and category summary */
export const getCommunityMeta = async (req, res) => {
  try {
    const [tags, categories] = await Promise.all([
      CommunityPost.distinct("cropTag"),
      CommunityPost.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
    ]);

    const activeTags = tags.filter(Boolean);

    res.json({
      cropTags: activeTags.length > 0 ? activeTags : ["Tomato", "Wheat", "Cotton", "Rice", "Chilli", "Potato"],
      categoryCounts: categories.reduce((acc, c) => {
        acc[c._id] = c.count;
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error("getCommunityMeta error:", error);
    res.status(500).json({ message: error.message });
  }
};

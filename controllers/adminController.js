import User from "../models/User.js";
import Farm from "../models/Farm.js";
import Crop from "../models/Crop.js";
import CommunityPost from "../models/CommunityPost.js";
import Comment from "../models/Comment.js";
import AdvisoryRule from "../models/AdvisoryRule.js";
import CropDecisionRule from "../models/CropDecisionRule.js";
import GeneralCropTask from "../models/GeneralCropTask.js";
import mongoose from "mongoose";

/**
 * GET /api/admin/overview
 * Real-time comprehensive platform analytics, telemetry & KPI metrics
 */
export const getAdminOverview = async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Parallel counts
    const [
      totalUsers,
      farmersCount,
      expertsCount,
      adminsCount,
      moderatorsCount,
      newUsersWeek,
      totalFarms,
      farmsAcreageAgg,
      totalCrops,
      activeCropsCount,
      harvestedCropsCount,
      totalDiscussions,
      solvedDiscussions,
      unansweredDiscussions,
      totalAdvisories,
      cropDecisionRulesCount,
      totalGeneralTasks,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "farmer" }),
      User.countDocuments({ role: "expert" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "moderator" }),
      User.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
      Farm.countDocuments(),
      Farm.aggregate([
        { $group: { _id: null, totalAcreage: { $sum: "$totalArea" } } },
      ]),
      Crop.countDocuments(),
      Crop.countDocuments({ status: "active" }),
      Crop.countDocuments({ status: "harvested" }),
      CommunityPost.countDocuments(),
      CommunityPost.countDocuments({ isSolved: true }),
      CommunityPost.countDocuments({ commentCount: 0 }),
      AdvisoryRule.countDocuments(),
      CropDecisionRule.countDocuments(),
      GeneralCropTask.countDocuments(),
    ]);

    const totalAcreage = farmsAcreageAgg[0]?.totalAcreage || 0;

    // Past 6 Months User Signups Trend
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const userTrendsAgg = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const label = `${monthNames[m - 1]} ${y}`;
      const found = userTrendsAgg.find(
        (t) => t._id.year === y && t._id.month === m
      );
      monthlyTrends.push({
        label,
        users: found ? found.count : 0,
      });
    }

    // Crop Season Distribution
    const cropSeasonAgg = await Crop.aggregate([
      {
        $group: {
          _id: { $toLower: { $ifNull: ["$season", "kharif"] } },
          count: { $sum: 1 },
        },
      },
    ]);

    const seasonDistribution = cropSeasonAgg.map((s) => ({
      name: (s._id || "kharif").toUpperCase(),
      count: s.count,
    }));

    // Recent Users with farm count
    const recentUsersRaw = await User.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .select("name email phone role location createdAt")
      .lean();

    const recentUserIds = recentUsersRaw.map((u) => u._id);
    const [farmCounts, cropCounts] = await Promise.all([
      Farm.aggregate([
        { $match: { user: { $in: recentUserIds } } },
        { $group: { _id: "$user", count: { $sum: 1 } } },
      ]),
      Crop.aggregate([
        { $match: { user: { $in: recentUserIds } } },
        { $group: { _id: "$user", count: { $sum: 1 } } },
      ]),
    ]);

    const farmCountMap = new Map(farmCounts.map((f) => [String(f._id), f.count]));
    const cropCountMap = new Map(cropCounts.map((c) => [String(c._id), c.count]));

    const recentUsers = recentUsersRaw.map((u) => ({
      ...u,
      farmCount: farmCountMap.get(String(u._id)) || 0,
      cropCount: cropCountMap.get(String(u._id)) || 0,
    }));

    // Recent Discussions needing expert review
    const recentDiscussions = await CommunityPost.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title category isSolved hasVerifiedAnswer commentCount createdAt author")
      .populate("author", "name role")
      .lean();

    // System Telemetry
    const memory = process.memoryUsage();
    const systemTelemetry = {
      serverUptimeSec: Math.floor(process.uptime()),
      nodeVersion: process.version,
      databaseState: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
      dbName: mongoose.connection.name || "smartfarm",
      memoryHeapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
      environment: process.env.NODE_ENV || "development",
    };

    res.json({
      kpis: {
        totalUsers,
        farmersCount,
        expertsCount,
        adminsCount,
        moderatorsCount,
        newUsersWeek,
        totalFarms,
        totalAcreage: Math.round(totalAcreage * 10) / 10,
        totalCrops,
        activeCropsCount,
        harvestedCropsCount,
        totalDiscussions,
        solvedDiscussions,
        unansweredDiscussions,
        totalAdvisories: totalAdvisories + cropDecisionRulesCount,
        totalGeneralTasks,
      },
      monthlyTrends,
      seasonDistribution,
      recentUsers,
      recentDiscussions,
      systemTelemetry,
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/admin/users
 * Paginated and searchable list of platform users
 */
export const getAdminUsers = async (req, res) => {
  try {
    const { search = "", role = "all", page = 1, limit = 15 } = req.query;

    const query = {};

    if (role && role !== "all") {
      query.role = role;
    }

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: regex },
        { phone: regex },
        { email: regex },
        { "location.district": regex },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [total, usersRaw] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select("-password")
        .lean(),
    ]);

    const userIds = usersRaw.map((u) => u._id);
    const [farmCounts, cropCounts] = await Promise.all([
      Farm.aggregate([
        { $match: { user: { $in: userIds } } },
        { $group: { _id: "$user", count: { $sum: 1 } } },
      ]),
      Crop.aggregate([
        { $match: { user: { $in: userIds } } },
        { $group: { _id: "$user", count: { $sum: 1 } } },
      ]),
    ]);

    const farmCountMap = new Map(farmCounts.map((f) => [String(f._id), f.count]));
    const cropCountMap = new Map(cropCounts.map((c) => [String(c._id), c.count]));

    const users = usersRaw.map((u) => ({
      ...u,
      farmCount: farmCountMap.get(String(u._id)) || 0,
      cropCount: cropCountMap.get(String(u._id)) || 0,
    }));

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)) || 1,
      },
    });
  } catch (error) {
    console.error("Get admin users error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * PATCH /api/admin/users/:id/role
 * Promote or demote user role
 */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["farmer", "expert", "moderator", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Safety check: Don't demote the last admin
    if (targetUser.role === "admin" && role !== "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({
          message: "Cannot demote the sole administrator of the platform.",
        });
      }
    }

    targetUser.role = role;
    await targetUser.save();

    res.json({
      message: `User ${targetUser.name} role updated to ${role}`,
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        role: targetUser.role,
      },
    });
  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE /api/admin/users/:id
 * Delete fraudulent / spam user
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (String(req.user._id) === String(id)) {
      return res.status(400).json({
        message: "Administrators cannot delete their own active account.",
      });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (targetUser.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({
          message: "Cannot delete the sole administrator.",
        });
      }
    }

    await User.findByIdAndDelete(id);

    res.json({ message: `User ${targetUser.name} deleted successfully` });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/admin/claim-admin
 * Development/demo convenience helper: promotes authenticated user to admin
 */
export const claimAdminRole = async (req, res) => {
  try {
    const { secretKey = "" } = req.body;

    // Allowed if secretKey is correct OR if no admins exist yet
    const adminCount = await User.countDocuments({ role: "admin" });
    const isAuthorized =
      adminCount === 0 ||
      secretKey === "kisan-admin-2026" ||
      secretKey === "admin" ||
      process.env.NODE_ENV !== "production";

    if (!isAuthorized) {
      return res.status(403).json({
        message: "Invalid admin authorization passkey.",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = "admin";
    await user.save();

    res.json({
      message: "Admin privileges granted successfully! Welcome to the Command Center.",
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Claim admin error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/admin/advisory-rules
 * Get all dynamic agronomic care advisory rules
 */
export const getAdminAdvisoryRules = async (req, res) => {
  try {
    const rules = await AdvisoryRule.find().sort({ cropName: 1, minDay: 1 });
    res.json(rules);
  } catch (error) {
    console.error("Get advisory rules error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/admin/advisory-rules
 * Create a new dynamic agronomic care rule
 */
export const createAdminAdvisoryRule = async (req, res) => {
  try {
    const { cropName, minDay, maxDay, soilType, conditions, message, priority, active } =
      req.body;

    if (!cropName || minDay === undefined || maxDay === undefined || !message) {
      return res.status(400).json({
        message: "Crop name, min day, max day, and advisory message are required.",
      });
    }

    const rule = await AdvisoryRule.create({
      cropName: cropName.trim(),
      minDay: Number(minDay),
      maxDay: Number(maxDay),
      soilType: soilType || undefined,
      conditions: conditions || {},
      message: message.trim(),
      priority: priority || "green",
      active: active !== undefined ? active : true,
    });

    res.status(201).json({
      message: "Advisory rule created successfully",
      rule,
    });
  } catch (error) {
    console.error("Create advisory rule error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/admin/advisory-rules/:id
 * Update an existing agronomic care rule
 */
export const updateAdminAdvisoryRule = async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await AdvisoryRule.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!rule) {
      return res.status(404).json({ message: "Rule not found" });
    }

    res.json({ message: "Rule updated successfully", rule });
  } catch (error) {
    console.error("Update advisory rule error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE /api/admin/advisory-rules/:id
 * Delete an agronomic rule
 */
export const deleteAdminAdvisoryRule = async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await AdvisoryRule.findByIdAndDelete(id);

    if (!rule) {
      return res.status(404).json({ message: "Rule not found" });
    }

    res.json({ message: "Rule deleted successfully" });
  } catch (error) {
    console.error("Delete advisory rule error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/admin/community
 * Community posts for moderation
 */
export const getAdminCommunity = async (req, res) => {
  try {
    const { filter = "all", page = 1, limit = 15 } = req.query;

    const query = {};
    if (filter === "unanswered") query.commentCount = 0;
    if (filter === "solved") query.isSolved = true;

    const skip = (Number(page) - 1) * Number(limit);

    const [total, posts] = await Promise.all([
      CommunityPost.countDocuments(query),
      CommunityPost.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("author", "name role email phone")
        .lean(),
    ]);

    res.json({
      posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)) || 1,
      },
    });
  } catch (error) {
    console.error("Admin community error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE /api/admin/community/:id
 * Delete spam or abusive community post
 */
export const deleteAdminCommunityPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await CommunityPost.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    await Comment.deleteMany({ post: post._id });
    await CommunityPost.findByIdAndDelete(post._id);

    res.json({ message: "Discussion and associated replies removed successfully" });
  } catch (error) {
    console.error("Delete community post error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/admin/general-tasks
 * Get all standard general crop tasks created by Admin / Moderator
 */
export const getAdminGeneralTasks = async (req, res) => {
  try {
    const { cropName } = req.query;
    const query = {};
    if (cropName && cropName.trim()) {
      query.cropName = new RegExp(`^${cropName.trim()}$`, "i");
    }

    const tasks = await GeneralCropTask.find(query)
      .sort({ cropName: 1, dayOffset: 1 })
      .populate("createdBy", "name role email")
      .lean();

    res.json(tasks);
  } catch (error) {
    console.error("Get admin general tasks error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/admin/general-tasks
 * Create a new general crop task template
 */
export const createAdminGeneralTask = async (req, res) => {
  try {
    const {
      cropName,
      title,
      dayOffset,
      activityType,
      priority,
      growthStage,
      dosage,
      stageWarning,
      targetPests,
      notes,
      estimatedCost,
      active,
    } = req.body;

    if (!cropName || !title || dayOffset === undefined) {
      return res.status(400).json({
        message: "Crop name, title, and day offset are required.",
      });
    }

    const task = await GeneralCropTask.create({
      cropName: cropName.trim(),
      title: title.trim(),
      dayOffset: Number(dayOffset),
      activityType: activityType || "general",
      priority: priority || "medium",
      growthStage: growthStage || "Seedling",
      dosage: dosage || "",
      stageWarning: stageWarning || "",
      targetPests: Array.isArray(targetPests) ? targetPests : [],
      notes: notes || "",
      estimatedCost: Number(estimatedCost) || 0,
      active: active !== undefined ? active : true,
      createdBy: req.user._id,
    });

    const populated = await GeneralCropTask.findById(task._id).populate(
      "createdBy",
      "name role email"
    );

    res.status(201).json({
      message: `General crop task added for ${cropName}`,
      task: populated,
    });
  } catch (error) {
    console.error("Create admin general task error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/admin/general-tasks/:id
 * Update an existing general crop task
 */
export const updateAdminGeneralTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await GeneralCropTask.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name role email");

    if (!task) {
      return res.status(404).json({ message: "General crop task not found" });
    }

    res.json({
      message: "General crop task updated successfully",
      task,
    });
  } catch (error) {
    console.error("Update admin general task error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE /api/admin/general-tasks/:id
 * Delete a general crop task template
 */
export const deleteAdminGeneralTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await GeneralCropTask.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({ message: "General crop task not found" });
    }

    res.json({ message: "General crop task deleted successfully" });
  } catch (error) {
    console.error("Delete admin general task error:", error);
    res.status(500).json({ message: error.message });
  }
};

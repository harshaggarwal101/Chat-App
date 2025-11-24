import User from "../models/user.js";

// GET ALL USERS EXCEPT LOGGED-IN USER
export const getAllUsers = async (req, res) => {
  try {
    const loggedInUser = req.user._id;

    const users = await User.find({
      _id: { $ne: loggedInUser }
    }).select("name email _id");

    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users", error);
    res.status(500).json({ success: false, message: "error getting users" });
  }
};

// SEARCH USERS
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.json({ success: true, users: [] });
    }

    const loggedInUser = req.user._id;

    const users = await User.find({
      _id: { $ne: loggedInUser },        
      name: { $regex: query, $options: "i" }
    }).select("name email _id");

    res.json({ success: true, users });
  } catch (error) {
    console.error("Error searching users", error);
    res.status(500).json({ success: false, message: "search failed" });
  }
};

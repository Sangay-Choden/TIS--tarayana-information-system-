const cloudinary = require("../config/cloudinary");
const Banner = require("../models/bannerModel");
exports.uploadBanner = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "TIS_login-banner",
    });

    const banner = await Banner.create({
      imageUrl: result.secure_url, // ✅ MUST match frontend
    });

    res.json({
      imageUrl: banner.imageUrl,
    });
  } catch (err) {
    console.error("CLOUDINARY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getBanner = async (req, res) => {
  const banner = await Banner.findOne({
    imageUrl: { $ne: null },
  }).sort({ createdAt: -1 });

  if (!banner) {
    return res.json({ imageUrl: null });
  }

  res.json({ imageUrl: banner.imageUrl });
};
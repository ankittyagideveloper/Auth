import jwt from "jsonwebtoken";

export const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies?.token || "";
    console.log(token ? "TokenFound" : "Token not Found");
    if (!token) {
      console.log("No Token");

      return res.status(401).json({
        success: false,
        message: "Authentication failed!!",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decoded, "decoded data");
    req.user = decoded;
    next();
  } catch (error) {
    console.log("Auth middleware failure");
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

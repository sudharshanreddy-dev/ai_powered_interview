import jwt from "jsonwebtoken";

export const authorize = (req, res, next) => {
    const token = req.cookies.access_token;

    if(!token){
        return res.status(401).json({ message: "Access token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired access token" });
    }
}
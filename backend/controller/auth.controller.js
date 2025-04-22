import prisma from "../utils/prisma.js";
import { comparePassword, hashPassword } from "../helper/auth.helper.js";
import { generate_token, generate_refresh_token } from "../utils/token.js";


export const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const exist = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if (exist) {
            return res.status(400).json({
                message: "User already exist"
            })
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }

        })

        console.log("user created", user);
        return res.status(201).json({
            message: "User created successfully",
        })
    }


    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "something went wrong"
        })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const passCompare = await comparePassword(password, user.password);

        if (!passCompare) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const access_token = generate_token(user);
        const refresh_token = generate_refresh_token(user);

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: refresh_token }
        });

        res.cookie("access_token", access_token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 15 * 60 * 1000 
        });

        res.cookie("refresh_token", refresh_token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        return res.status(200).json({ message: "User logged in successfully" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
};




export const refresh_access_token = async (req, res) => {
    try {
        const token = req.cookies.refresh_token;
        if (!token) return res.status(401).json({ message: "No refresh token" });

        const decoded = verify_refresh_token(token);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        if (!user || user.refreshToken !== token) {
            res.clearCookie("refresh_token");
            res.clearCookie("access_token");
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        const new_access_token = generate_token(user);
        const new_refresh_token = generate_refresh_token(user);

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: new_refresh_token }
        });

        res.cookie("access_token", new_access_token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 15 * 60 * 1000
        });

        res.cookie("refresh_token", new_refresh_token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ message: "Access token refreshed successfully" });

    } catch (error) {
        console.error(error);
        res.clearCookie("refresh_token");
        res.clearCookie("access_token");
        return res.status(403).json({ message: "Invalid or expired refresh token" });
    }
};


export const logout = async (req, res) => {

    try{
    const token = req.cookies.refresh_token;

    if(token){
        const decoded = verify_refresh_token(token);
            await prisma.user.update({
                where: { id: decoded.id },
                data: { refreshToken: null }
            });
    }

    res.clearCookie("access_token", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production"
    });

    res.clearCookie("refresh_token", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production"
    });

    return res.status(200).json({ message: "User logged out successfully" });

}

    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went wrong" });
}
}

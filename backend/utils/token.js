import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.ACCESS_SECRET
const REFRESH_SECRET = process.env.REFRESH_SECRET

export const generate_token = (user) => {
    return jwt.sign(
        { id: user.id, name: user.name, email: user.email },
        ACCESS_SECRET,
        { expiresIn: '15m' }
    )
}

export const generate_refresh_token = (user)=>{
    return jwt.sign(
        { id: user.id, name: user.name, email: user.email },
        REFRESH_SECRET,
        { expiresIn: '7d' }
    )
}

export const verify_access_token = (token)=>{
    return jwt.verify(token, ACCESS_SECRET)
}

export const verify_refresh_token = (token)=>{
    return jwt.verify(token, REFRESH_SECRET)
}

const sendToken = (user, statusCode, res) => {
    const token = user.getJWTToken();
    // Cookies
    const option = {
        expire: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };
    const userWithoutPassword = { ...user._doc };
    delete userWithoutPassword.password;
    res.status(statusCode).cookie("token", token, option).json({
        success: true,
        // get response without password
        user: userWithoutPassword,
        token
    });
};
module.exports = sendToken;
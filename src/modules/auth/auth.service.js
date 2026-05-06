// src/modules/auth/auth.service.js
import SessionModel from "../session/session.model.js";
import { JwtUtils } from "../../utils/jwt.util.js";

class AuthService {
  /**
   * User payload for JWT
   */
  static getUserPayload(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user?.username,
      role: user.role,
    };
  }

  /**
   * Generate Access + Refresh Tokens + Create Session
   */
  static async generateAuthTokens(user, req) {
    const payload = this.getUserPayload(user);

    const { accessToken, refreshToken } = JwtUtils.generateTokenPair(payload);

    // Save refresh token per-device session
    await SessionModel.create({
      userId: user.id,
      refreshToken,
      ip: req?.ip,
      userAgent: req?.headers["user-agent"],
      isActive: true,
    });

    return { accessToken, refreshToken };
  }

  /**
   * Refresh Token Handler
   */
  static async refreshToken(refreshToken) {
    if (!refreshToken) throw new Error("Refresh token is required");

    const session = await SessionModel.findOne({ 
      refreshToken, 
      isActive: true 
    });
    
    if (!session) throw new Error("Invalid or expired session");

    const decoded = JwtUtils.safeVerify(refreshToken);
    if (!decoded) throw new Error("Invalid or expired refresh token");

    const accessToken = JwtUtils.refreshAccessToken(refreshToken);
    return { accessToken };
  }

  /**
   * Logout from current device
   */
  static async logout(refreshToken) {
    if (!refreshToken) return { message: "Already logged out" };
    
    await SessionModel.updateByRefreshToken(refreshToken, { 
      isActive: false 
    });

    return { message: "Logged out successfully" };
  }

  /**
   * Logout from all devices
   */
  static async logoutAll(userId) {
    await SessionModel.find({ 
      where: { userId } 
    }).then(sessions => {
      return Promise.all(
        sessions.map(session => 
          SessionModel.updateById(session.id, { isActive: false })
        )
      );
    });

    return { message: "Logged out from all devices" };
  }
}

export default AuthService;

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middlewares/customErrors.js";
import { ErrorCodes } from "../utils/errorCodes.js";

const generateAccessToken = (user) => {
  const jti = crypto.randomUUID();
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, jti },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new BadRequestError("Email and password are required", ErrorCodes.BAD_REQUEST);
    }

    const credential = await req.db.userCredential.findUnique({
      where: { username: email },
      include: { user: true },
    });

    if (!credential) {
      throw new UnauthorizedError("Invalid credentials", ErrorCodes.INVALID_CREDENTIALS);
    }

    if (!credential.isActive) {
      throw new ForbiddenError("Account is deactivated", ErrorCodes.ACCOUNT_DEACTIVATED);
    }

    // Check account lockout
    if (credential.lockoutUntil && credential.lockoutUntil > new Date()) {
      const minutesLeft = Math.ceil((new Date(credential.lockoutUntil) - new Date()) / 60000);
      throw new ForbiddenError(`Account is temporarily locked. Try again in ${minutesLeft} minutes.`, ErrorCodes.FORBIDDEN);
    }

    const isMatch = await bcrypt.compare(password, credential.password);
    if (!isMatch) {
      // Increment failed attempts
      const failedAttempts = credential.failedAttempts + 1;
      let lockoutUntil = null;
      if (failedAttempts >= 5) {
        lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
      }
      
      await req.db.userCredential.update({
        where: { id: credential.id },
        data: { failedAttempts, lockoutUntil },
      });

      throw new UnauthorizedError("Invalid credentials", ErrorCodes.INVALID_CREDENTIALS);
    }

    // Reset failed attempts on success
    await req.db.userCredential.update({
      where: { id: credential.id },
      data: { failedAttempts: 0, lockoutUntil: null },
    });

    // Generate short-lived access token and 7d refresh token
    const token = generateAccessToken({ ...credential.user, role: credential.role });
    const refreshTokenString = crypto.randomBytes(40).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await req.db.refreshToken.create({
      data: {
        token: refreshTokenString,
        userId: credential.user.id,
        expiresAt,
      },
    });

    // Fetch role-based permissions
    const rolePermissions = await req.db.rolePermission.findMany({
      where: { role: credential.role },
    });

    res.json({
      token,
      refreshToken: refreshTokenString,
      user: {
        id: credential.user.id,
        name: credential.user.name,
        email: credential.user.email,
        role: credential.role,
        permissions: rolePermissions.map(p => ({
          module: p.module,
          canDisplay: p.canDisplay,
          canSave: p.canSave,
          canEdit: p.canEdit,
          canDelete: p.canDelete,
          canPrint: p.canPrint,
        })),
      },
    });
  } catch (err) {
    throw err;
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new BadRequestError("Refresh token is required", ErrorCodes.BAD_REQUEST);
    }

    const dbToken = await req.db.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { credentials: true } } },
    });

    if (!dbToken || dbToken.expiresAt < new Date()) {
      if (dbToken) {
        await req.db.refreshToken.delete({ where: { id: dbToken.id } });
      }
      throw new UnauthorizedError("Refresh token is invalid or expired", ErrorCodes.TOKEN_INVALID);
    }

    // Generate new access token
    const userPayload = {
      id: dbToken.user.id,
      email: dbToken.user.email,
      role: dbToken.user.credentials?.role || "user",
    };
    const token = generateAccessToken(userPayload);

    // Rotate refresh token
    const newRefreshTokenString = crypto.randomBytes(40).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await req.db.$transaction([
      req.db.refreshToken.delete({ where: { id: dbToken.id } }),
      req.db.refreshToken.create({
        data: {
          token: newRefreshTokenString,
          userId: dbToken.userId,
          expiresAt,
        },
      }),
    ]);


    res.json({
      token,
      refreshToken: newRefreshTokenString,
    });
  } catch (err) {
    throw err;
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await req.db.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    // Blacklist current access token on logout
    const header = req.headers.authorization;
    if (header && header.startsWith("Bearer ")) {
      const tokenStr = header.slice(7);
      try {
        const decoded = jwt.verify(tokenStr, process.env.JWT_SECRET);
        if (decoded.jti) {
          const expAt = new Date(decoded.exp * 1000);
          await req.db.tokenBlacklist.upsert({
            where: { jti: decoded.jti },
            update: {},
            create: {
              jti: decoded.jti,
              expiresAt: expAt,
            },
          }).catch(() => {});
        }
      } catch (err) {
        // ignore
      }
    }

    res.json({ success: true });
  } catch (err) {
    throw err;
  }
};

export const getCurrentUserPermissions = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedError("Not authenticated", ErrorCodes.UNAUTHORIZED);
    }

    const rolePermissions = await req.db.rolePermission.findMany({
      where: { role: user.role },
    });

    res.json({
      success: true,
      permissions: rolePermissions.map(p => ({
        module: p.module,
        canDisplay: p.canDisplay,
        canSave: p.canSave,
        canEdit: p.canEdit,
        canDelete: p.canDelete,
        canPrint: p.canPrint,
      })),
    });
  } catch (err) {
    throw err;
  }
};

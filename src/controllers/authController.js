import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../middelwares/customErrors.js";


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new BadRequestError("Email and password are required");
    }

    const credential = await req.db.userCredential.findUnique({
      where: { username: email },
      include: { user: true },
    });

    if (!credential) {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (!credential.isActive) {
      throw new ForbiddenError("Account is deactivated");
    }

    const isMatch = await bcrypt.compare(password, credential.password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const token = jwt.sign(
      { id: credential.user.id, email: credential.user.email, role: credential.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: credential.user.id,
        name: credential.user.name,
        email: credential.user.email,
        role: credential.role,
      },
    });
  } catch (err) {
    throw err;
  }
};

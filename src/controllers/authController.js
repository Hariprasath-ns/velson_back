import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const credential = await req.db.userCredential.findUnique({
      where: { username: email },
      include: { user: true },
    });

    if (!credential) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!credential.isActive) {
      return res.status(403).json({ error: "Account is deactivated" });
    }

    const isMatch = await bcrypt.compare(password, credential.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: credential.user.id, email: credential.user.email, role: credential.role },
      process.env.JWT_SECRET || "fallback_secret",
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
    res.status(500).json({ error: err.message });
  }
};

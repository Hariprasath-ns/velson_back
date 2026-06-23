import { neonPrisma, dockerPrisma } from "../config/db.js";

const getDB = () => {
  return process.env.DB_ENV === "neon" ? neonPrisma : dockerPrisma;
};

export const parseUserAgent = (userAgentString) => {
  if (!userAgentString) return { browser: "Unknown", os: "Unknown" };
  
  let browser = "Unknown";
  let os = "Unknown";
  
  if (userAgentString.includes("Windows")) os = "Windows";
  else if (userAgentString.includes("Macintosh") || userAgentString.includes("Mac OS")) os = "macOS";
  else if (userAgentString.includes("Linux")) os = "Linux";
  else if (userAgentString.includes("Android")) os = "Android";
  else if (userAgentString.includes("like Mac")) os = "iOS";
  
  if (userAgentString.includes("Firefox")) browser = "Firefox";
  else if (userAgentString.includes("Chrome") && !userAgentString.includes("Chromium")) browser = "Chrome";
  else if (userAgentString.includes("Safari") && !userAgentString.includes("Chrome")) browser = "Safari";
  else if (userAgentString.includes("Edge") || userAgentString.includes("Edg")) browser = "Edge";
  else if (userAgentString.includes("MSIE") || userAgentString.includes("Trident")) browser = "Internet Explorer";
  
  return { browser, os };
};

export const getActorContext = async (req) => {
  if (!req) {
    return {
      userId: null,
      userName: "System",
      email: "system@erp.local",
      role: "SYSTEM",
      department: "SYSTEM",
      ipAddress: null,
      userAgent: "System",
      browser: "System",
      os: "System",
      sessionId: "system-session",
      timestamp: new Date().toISOString()
    };
  }

  if (!req.user) {
    const userAgentStr = req.headers["user-agent"] || "";
    const { browser, os } = parseUserAgent(userAgentStr);
    
    let ipAddress = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.ip || req.socket.remoteAddress || null;
    if (typeof ipAddress === "string") {
      if (ipAddress.includes(",")) {
        ipAddress = ipAddress.split(",")[0].trim();
      }
      if (ipAddress === "::1" || ipAddress === "::ffff:127.0.0.1") {
        ipAddress = "127.0.0.1";
      }
    }

    return {
      userId: null,
      userName: "Unknown User",
      email: "unknown@erp.local",
      role: "UNKNOWN",
      department: "UNKNOWN",
      ipAddress,
      userAgent: userAgentStr,
      browser,
      os,
      sessionId: `anon-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  }

  const db = getDB();
  const userId = req.user.id;
  const email = req.user.email;
  const role = req.user.role;

  // Fetch user name
  let userName = req.user.name || email;
  if (!req.user.name && userId) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { name: true }
    });
    if (user) {
      userName = user.name;
    }
  }

  // Fetch department from EmployeeMaster
  let department = "Unknown";
  if (email) {
    const employee = await db.employeeMaster.findFirst({
      where: {
        emailId: {
          equals: email,
          mode: "insensitive"
        }
      },
      select: { department: true }
    });
    if (employee && employee.department) {
      department = employee.department;
    }
  }

  const userAgentStr = req.headers["user-agent"] || "";
  const { browser, os } = parseUserAgent(userAgentStr);

  let ipAddress = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.ip || req.socket.remoteAddress || "127.0.0.1";
  if (typeof ipAddress === "string") {
    if (ipAddress.includes(",")) {
      ipAddress = ipAddress.split(",")[0].trim();
    }
    if (ipAddress === "::1" || ipAddress === "::ffff:127.0.0.1") {
      ipAddress = "127.0.0.1";
    }
  }
  
  // Use authorization header or generate a session token identifier
  const authHeader = req.headers.authorization || "";
  const sessionId = req.user.sessionId || (authHeader ? authHeader.substring(authHeader.length - 20) : `sess-${userId}-${Date.now()}`);

  return {
    userId,
    userName,
    email,
    role,
    department,
    ipAddress,
    userAgent: userAgentStr,
    browser,
    os,
    sessionId,
    timestamp: new Date().toISOString()
  };
};

import "dotenv/config";
import { defineConfig } from "prisma/config";

const url =
  process.env.DB_ENV === "neon"
    ? process.env.NEON_DATABASE_URL
    : process.env.DOCKER_DATABASE_URL;

const getShadowUrl = (baseUri) => {
  if (!baseUri) return undefined;
  return baseUri.replace(/\/([^/?]+)(\?|$)/, "/$1_shadow$2");
};

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url,
    shadowDatabaseUrl: getShadowUrl(url),
  },
});

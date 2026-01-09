import { Cookie } from "rjweb-server";
import { db, fileRouter, config } from "../../";
import bcrypt from "bcryptjs";
import { hash } from "crypto";

export = new fileRouter.Path("/").http(
  "POST",
  "/api/account/login",
  (http) =>
    http.onRequest(async (ctr) => {
      const [data, error] = await ctr.bindBody((z) =>
        z.object({
          username: z.string().min(3).max(20),
          password: z.string().min(6).max(200),
        })
      );

      if (!data)
        return ctr.status(ctr.$status.BAD_REQUEST).print(error.toString());

      // Find user
      const user = await db.collection("users").findOne({
        username: data.username,
      });

      if (!user) {
        return ctr.status(ctr.$status.UNAUTHORIZED).print({ error: "Invalid username or password" });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

      if (!isPasswordValid) {
        return ctr.status(ctr.$status.UNAUTHORIZED).print({ error: "Invalid username or password" });
      }

      // Create Session
      const token = hash("sha256", crypto.randomUUID() + data.username, "hex");
      await db.collection("sessions").insertOne({
        id: crypto.randomUUID(),
        userId: user.id,
        token,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90), // 90 days
      });

      ctr.cookies.set(
        "thoughtful_session",
        new Cookie(token, {
          domain: config.CookieDomain,
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90), // 90 days
        })
      );

      return ctr.print({ success: true });
    })
);

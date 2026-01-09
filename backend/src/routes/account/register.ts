import { Cookie } from "rjweb-server";
import { db, fileRouter, config } from "../../";
import bcrypt from "bcryptjs";
import { hash } from "crypto";

export = new fileRouter.Path("/").http(
  "POST",
  "/api/account/register",
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

      const id = crypto.randomUUID();
      const res = await db.collection("users").insertOne({
        id,
        username: data.username,
        passwordHash: await bcrypt.hash(data.password, 10),
        createdAt: new Date(),
      });

      if (res.acknowledged === false) {
        return ctr.status(500).print({ error: "Failed to set the value" });
      }

      // Create Session
      const token = hash("sha256", crypto.randomUUID() + data.username, "hex");
      await db.collection("sessions").insertOne({
        id: crypto.randomUUID(),
        userId: id,
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

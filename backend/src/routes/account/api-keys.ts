import { db, fileRouter } from "../../";
import { authCheck } from "../../lib/Auth";
import crypto from "crypto";

export = new fileRouter.Path("/")
  .http("GET", "/api/account/api-keys", (http) =>
    http.onRequest(async (ctr) => {
      const cookie = ctr.cookies.get("thoughtful_session") || null;
      const apiHeader = (ctr.headers && ctr.headers.get)
        ? ctr.headers.get("api-authentication") || null
        : null;
      const auth = await authCheck(cookie, apiHeader);
      if (!auth.state) {
        return ctr.status(ctr.$status.UNAUTHORIZED).print({ error: auth.message });
      }

      const user = await db.collection("users").findOne({ id: auth.userId });
      if (!user) {
        return ctr.status(ctr.$status.NOT_FOUND).print({ error: "User not found" });
      }

      const keys = (user.apiKeys || []).map((k: any) => ({
        id: k.id,
        description: k.description,
        createdAt: k.createdAt,
      }));

      return ctr.print({ success: true, apiKeys: keys });
    })
  )
  .http("POST", "/api/account/api-keys/create", (http) =>
    http.onRequest(async (ctr) => {
      const cookie = ctr.cookies.get("thoughtful_session") || null;
      const apiHeader = (ctr.headers && ctr.headers.get)
        ? ctr.headers.get("api-authentication") || null
        : null;
      const auth = await authCheck(cookie, apiHeader);
      if (!auth.state) {
        return ctr.status(ctr.$status.UNAUTHORIZED).print({ error: auth.message });
      }

      const [data, error] = await ctr.bindBody((z) =>
        z.object({ description: z.string().min(1).max(200) })
      );

      if (!data) return ctr.status(ctr.$status.BAD_REQUEST).print({ error: error.toString() });

      const user = await db.collection("users").findOne({ id: auth.userId });
      if (!user) return ctr.status(ctr.$status.NOT_FOUND).print({ error: "User not found" });

      const existing = user.apiKeys || [];
      if (existing.length >= 4) {
        return ctr.status(ctr.$status.BAD_REQUEST).print({ error: "API key limit reached (max 4)" });
      }

      const raw = crypto.randomBytes(32).toString("hex");
      const keyHash = crypto.createHash("sha256").update(raw).digest("hex");
      const keyId = crypto.randomUUID();

      const newKey = {
        id: keyId,
        description: data.description,
        keyHash,
        createdAt: new Date(),
      };

      const res = await db.collection("users").updateOne(
        { id: auth.userId },
        { $push: { apiKeys: newKey } } as any,
        { upsert: false }
      );

      if (!res.acknowledged) {
        return ctr.status(ctr.$status.INTERNAL_SERVER_ERROR).print({ error: "Failed to create API key" });
      }

      return ctr.print({ success: true, apiKey: { id: keyId, description: data.description, createdAt: newKey.createdAt, token: raw } });
    })
  )
  .http("DELETE", "/api/account/api-keys/{id}", (http) =>
    http.onRequest(async (ctr) => {
      const cookie = ctr.cookies.get("thoughtful_session") || null;
      const apiHeader = (ctr.headers && ctr.headers.get)
        ? ctr.headers.get("api-authentication") || null
        : null;
      const auth = await authCheck(cookie, apiHeader);
      if (!auth.state) {
        return ctr.status(ctr.$status.UNAUTHORIZED).print({ error: auth.message });
      }

      const keyId = ctr.params.get("id");
      if (!keyId) return ctr.status(ctr.$status.BAD_REQUEST).print({ error: "Key id required" });

      const res = await db.collection("users").updateOne(
        { id: auth.userId },
        { $pull: { apiKeys: { id: keyId } } } as any
      );

      if (!res.acknowledged) {
        return ctr.status(ctr.$status.INTERNAL_SERVER_ERROR).print({ error: "Failed to delete API key" });
      }

      return ctr.print({ success: true });
    })
  );



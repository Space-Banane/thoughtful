import { db, fileRouter } from "../../";
import { authCheck } from "../../lib/Auth";
import { DEFAULT_STATUSES, StatusDefinition } from "../../types";

// GET /api/account/statuses - Fetch user's custom status definitions
export = new fileRouter.Path("/")
  .http("GET", "/api/account/statuses", (http) =>
    http.onRequest(async (ctr) => {
      const cookie = ctr.cookies.get("thoughtful_session") || null;
      const apiHeader = (ctr.headers && ctr.headers.get)
        ? ctr.headers.get("API-Authentication") || null
        : null;
      const auth = await authCheck(cookie, apiHeader);
      if (!auth.state) {
        return ctr
          .status(ctr.$status.UNAUTHORIZED)
          .print({ error: auth.message });
      }

      const user = await db.collection("users").findOne({ id: auth.userId });
      if (!user) {
        return ctr
          .status(ctr.$status.NOT_FOUND)
          .print({ error: "User not found" });
      }

      // Return custom statuses (defaults are handled client-side)
      return ctr.print({
        statusDefinitions: user.statusDefinitions || [],
      });
    })
  )
  .http("POST", "/api/account/statuses/save", (http) =>
    http.onRequest(async (ctr) => {
      const cookie = ctr.cookies.get("thoughtful_session") || null;
      const apiHeader = (ctr.headers && ctr.headers.get)
        ? ctr.headers.get("API-Authentication") || null
        : null;
      const auth = await authCheck(cookie, apiHeader);
      if (!auth.state) {
        return ctr
          .status(ctr.$status.UNAUTHORIZED)
          .print({ error: auth.message });
      }

      const [data, error] = await ctr.bindBody((z) =>
        z.object({
          id: z.string().optional(), // If provided, update; otherwise create
          name: z.string().min(1).max(50),
          color: z
            .string()
            .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color format"),
        })
      );

      if (!data) {
        return ctr
          .status(ctr.$status.BAD_REQUEST)
          .print({ error: error.toString() });
      }

      // Prevent using reserved IDs
      if (data.id && DEFAULT_STATUSES.some((s) => s.id === data.id)) {
        return ctr
          .status(ctr.$status.BAD_REQUEST)
          .print({ error: "Cannot modify default statuses" });
      }

      const user = await db.collection("users").findOne({ id: auth.userId });
      if (!user) {
        return ctr
          .status(ctr.$status.NOT_FOUND)
          .print({ error: "User not found" });
      }

      const statusDefinitions = user.statusDefinitions || [];
      const statusId = data.id || crypto.randomUUID();

      // Check if updating existing or creating new
      const existingIndex = statusDefinitions.findIndex(
        (s: StatusDefinition) => s.id === statusId
      );
      if (existingIndex >= 0) {
        // Update existing
        statusDefinitions[existingIndex] = {
          id: statusId,
          name: data.name,
          color: data.color,
        };
      } else {
        // Create new
        statusDefinitions.push({
          id: statusId,
          name: data.name,
          color: data.color,
        });
      }

      const res = await db
        .collection("users")
        .updateOne({ id: auth.userId }, { $set: { statusDefinitions } });

      if (!res.acknowledged) {
        return ctr
          .status(ctr.$status.INTERNAL_SERVER_ERROR)
          .print({ error: "Failed to save status" });
      }

      return ctr.print({
        success: true,
        status: { id: statusId, name: data.name, color: data.color },
      });
    })
  )
  // DELETE /api/account/statuses/:id - Delete custom status definition
  .http("DELETE", "/api/account/statuses/{id}", (http) =>
    http.onRequest(async (ctr) => {
      const cookie = ctr.cookies.get("thoughtful_session") || null;
      const apiHeader = (ctr.headers && ctr.headers.get)
        ? ctr.headers.get("API-Authentication") || null
        : null;
      const auth = await authCheck(cookie, apiHeader);
      if (!auth.state) {
        return ctr
          .status(ctr.$status.UNAUTHORIZED)
          .print({ error: auth.message });
      }

      const statusId = ctr.params.get("id");
      if (!statusId) {
        return ctr
          .status(ctr.$status.BAD_REQUEST)
          .print({ error: "Status ID required" });
      }

      // Prevent deleting default statuses
      if (DEFAULT_STATUSES.some((s) => s.id === statusId)) {
        return ctr
          .status(ctr.$status.BAD_REQUEST)
          .print({ error: "Cannot delete default statuses" });
      }

      // Check if any ideas use this status
      const ideasUsingStatus = await db
        .collection("ideas")
        .countDocuments({ userId: auth.userId, statusId });

      if (ideasUsingStatus > 0) {
        // Return warning info
        return ctr.print({
          warning: true,
          message: `${ideasUsingStatus} idea(s) use this status`,
          ideasCount: ideasUsingStatus,
        });
      }

      // Safe to delete
      const user = await db.collection("users").findOne({ id: auth.userId });
      if (!user) {
        return ctr
          .status(ctr.$status.NOT_FOUND)
          .print({ error: "User not found" });
      }

      const statusDefinitions = (user.statusDefinitions || []).filter(
        (s: StatusDefinition) => s.id !== statusId
      );

      const res = await db
        .collection("users")
        .updateOne({ id: auth.userId }, { $set: { statusDefinitions } });

      if (!res.acknowledged) {
        return ctr
          .status(ctr.$status.INTERNAL_SERVER_ERROR)
          .print({ error: "Failed to delete status" });
      }

      return ctr.print({ success: true });
    })
  );

// POST /api/account/statuses/:id/force-delete - Force delete and mark ideas as "deleted"
new fileRouter.Path("/").http(
  "POST",
  "/api/account/statuses/{id}/force-delete",
  (http) =>
    http.onRequest(async (ctr) => {
      const cookie = ctr.cookies.get("thoughtful_session") || null;
      const apiHeader = (ctr.headers && ctr.headers.get)
        ? ctr.headers.get("API-Authentication") || null
        : null;
      const auth = await authCheck(cookie, apiHeader);
      if (!auth.state) {
        return ctr
          .status(ctr.$status.UNAUTHORIZED)
          .print({ error: auth.message });
      }

      const statusId = ctr.params.get("id");
      if (!statusId) {
        return ctr
          .status(ctr.$status.BAD_REQUEST)
          .print({ error: "Status ID required" });
      }

      // Prevent deleting default statuses
      if (DEFAULT_STATUSES.some((s) => s.id === statusId)) {
        return ctr
          .status(ctr.$status.BAD_REQUEST)
          .print({ error: "Cannot delete default statuses" });
      }

      // Mark all ideas with this status as "deleted"
      await db
        .collection("ideas")
        .updateMany(
          { userId: auth.userId, statusId },
          { $set: { statusId: "deleted" } }
        );

      // Remove status from user's definitions
      const user = await db.collection("users").findOne({ id: auth.userId });
      if (!user) {
        return ctr
          .status(ctr.$status.NOT_FOUND)
          .print({ error: "User not found" });
      }

      const statusDefinitions = (user.statusDefinitions || []).filter(
        (s: StatusDefinition) => s.id !== statusId
      );

      const res = await db
        .collection("users")
        .updateOne({ id: auth.userId }, { $set: { statusDefinitions } });

      if (!res.acknowledged) {
        return ctr
          .status(ctr.$status.INTERNAL_SERVER_ERROR)
          .print({ error: "Failed to delete status" });
      }

      return ctr.print({ success: true });
    })
);

// POST /api/account/statuses/fix-unknown - Batch update "deleted"/"unknown" status ideas
new fileRouter.Path("/").http(
  "POST",
  "/api/account/statuses/fix-unknown",
  (http) =>
    http.onRequest(async (ctr) => {
      const cookie = ctr.cookies.get("thoughtful_session") || null;
      const apiHeader = (ctr.headers && ctr.headers.get)
        ? ctr.headers.get("API-Authentication") || null
        : null;
      const auth = await authCheck(cookie, apiHeader);
      if (!auth.state) {
        return ctr
          .status(ctr.$status.UNAUTHORIZED)
          .print({ error: auth.message });
      }

      const [data, error] = await ctr.bindBody((z) =>
        z.object({
          newStatusId: z.string(),
        })
      );

      if (!data) {
        return ctr
          .status(ctr.$status.BAD_REQUEST)
          .print({ error: error.toString() });
      }

      // Update all ideas with "deleted" status to the new status
      const result = await db
        .collection("ideas")
        .updateMany(
          { userId: auth.userId, statusId: "deleted" },
          { $set: { statusId: data.newStatusId } }
        );

      return ctr.print({
        success: true,
        updatedCount: result.modifiedCount,
      });
    })
);

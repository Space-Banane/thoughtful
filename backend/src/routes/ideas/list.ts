import { db, fileRouter } from "../../";
import { authCheck } from "../../lib/Auth";

export = new fileRouter.Path("/").http(
  "GET",
  "/api/ideas/list",
  (http) =>
    http.onRequest(async (ctr) => {
      // Check authentication
      const auth = await authCheck(
        ctr.cookies.get("thoughtful_session") || null
      );
      if (!auth.state) {
        return ctr.status(ctr.$status.UNAUTHORIZED).print({ error: auth.message });
      }

      // Get all ideas for the authenticated user, sorted by updatedAt (newest first)
      const ideas = await db
        .collection("ideas")
        .find({ userId: auth.userId })
        .sort({ updatedAt: -1 })
        .toArray();

      return ctr.print({ 
        success: true, 
        ideas
      });
    })
);

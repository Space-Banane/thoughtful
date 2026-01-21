import { db, fileRouter } from "../../";
import { authCheck } from "../../lib/Auth";

export = new fileRouter.Path("/").http(
  "GET",
  "/api/ideas/search",
  (http) =>
    http.onRequest(async (ctr) => {
      // Check authentication
      const cookie = ctr.cookies.get("thoughtful_session") || null;
      const apiHeader = (ctr.headers && ctr.headers.get)
        ? ctr.headers.get("API-Authentication") || null
        : null;
      const auth = await authCheck(cookie, apiHeader);
      if (!auth.state) {
        return ctr.status(ctr.$status.UNAUTHORIZED).print({ error: auth.message });
      }

      // Get query parameter
      const query = ctr.queries.get("q") || "";

      if (!query) {
        return ctr.status(ctr.$status.BAD_REQUEST).print({ 
          error: "Search query parameter 'q' is required" 
        });
      }

      // Search ideas by title, description, or tags (case-insensitive)
      const ideas = await db
        .collection("ideas")
        .find({
          userId: auth.userId,
          $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { tags: { $elemMatch: { $regex: query, $options: "i" } } }
          ]
        })
        .sort({ updatedAt: -1 })
        .toArray();

      return ctr.print({ 
        success: true, 
        ideas,
        query
      });
    })
);

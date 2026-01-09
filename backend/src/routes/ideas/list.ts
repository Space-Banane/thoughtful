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

      // Get query parameters for filtering and sorting
      const statusId = ctr.queries.get("statusId");
      const sortBy = ctr.queries.get("sortBy") || "updatedAt"; // createdAt, updatedAt, title
      const sortOrder = ctr.queries.get("sortOrder") || "desc"; // asc, desc

      // Build filter query
      const filter: any = { userId: auth.userId };
      if (statusId) {
        filter.statusId = statusId;
      }

      // Build sort object
      const sort: any = {};
      if (sortBy === "title") {
        sort.title = sortOrder === "asc" ? 1 : -1;
      } else if (sortBy === "createdAt") {
        sort.createdAt = sortOrder === "asc" ? 1 : -1;
      } else {
        sort.updatedAt = sortOrder === "asc" ? 1 : -1;
      }

      // Get all ideas for the authenticated user with filters and sorting
      const ideas = await db
        .collection("ideas")
        .find(filter)
        .sort(sort)
        .toArray();

      return ctr.print({ 
        success: true, 
        ideas
      });
    })
);

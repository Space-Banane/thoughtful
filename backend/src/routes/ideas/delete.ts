import { db, fileRouter } from "../../";
import { authCheck } from "../../lib/Auth";

export = new fileRouter.Path("/").http(
  "DELETE",
  "/api/ideas/delete",
  (http) =>
    http.onRequest(async (ctr) => {
      // Check authentication
      const auth = await authCheck(
        ctr.cookies.get("thoughtful_session") || null
      );
      if (!auth.state) {
        return ctr.status(ctr.$status.UNAUTHORIZED).print({ error: auth.message });
      }

      // Validate request body
      const [data, error] = await ctr.bindBody((z) =>
        z.object({
          id: z.string(),
        })
      );

      if (!data) {
        return ctr.status(ctr.$status.BAD_REQUEST).print({ error: error.toString() });
      }

      // Check if idea exists and belongs to the user
      const existingIdea = await db.collection("ideas").findOne({ 
        id: data.id, 
        userId: auth.userId 
      });

      if (!existingIdea) {
        return ctr.status(ctr.$status.NOT_FOUND).print({ 
          error: "Idea not found or you don't have permission to delete it" 
        });
      }

      // Delete the idea
      const res = await db.collection("ideas").deleteOne({
        id: data.id,
        userId: auth.userId,
      });

      if (!res.acknowledged || res.deletedCount === 0) {
        return ctr.status(ctr.$status.INTERNAL_SERVER_ERROR).print({ 
          error: "Failed to delete idea" 
        });
      }

      return ctr.print({ 
        success: true,
        message: "Idea deleted successfully"
      });
    })
);

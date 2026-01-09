import { db, fileRouter } from "../../";
import { authCheck } from "../../lib/Auth";

export = new fileRouter.Path("/").http(
  "PUT",
  "/api/ideas/update",
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
          title: z.string().min(1).max(200).optional(),
          description: z.string().min(1).max(5000).optional(),
          tags: z.array(z.string()).max(5).optional(),
          icon: z.string().optional(),
          statusId: z.string().optional(),
          todos: z.array(
            z.object({
              id: z.string(),
              title: z.string().min(1).max(200),
              items: z.array(
                z.object({
                  id: z.string(),
                  text: z.string().min(1).max(500),
                  completed: z.boolean(),
                })
              ).max(100),
            })
          ).max(5).optional(),
          resources: z.array(
            z.object({
              name: z.string().min(1).max(200),
              link: z.string().url(),
            })
          ).optional(),
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
          error: "Idea not found or you don't have permission to update it" 
        });
      }

      // Build update object
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.tags !== undefined) updateData.tags = data.tags;
      if (data.icon !== undefined) updateData.icon = data.icon;
      if (data.todos !== undefined) updateData.todos = data.todos;
      if (data.resources !== undefined) updateData.resources = data.resources;
      if (data.statusId !== undefined) updateData.statusId = data.statusId;

      // Update the idea
      const res = await db.collection("ideas").updateOne(
        { id: data.id, userId: auth.userId },
        { $set: updateData }
      );

      if (!res.acknowledged) {
        return ctr.status(ctr.$status.INTERNAL_SERVER_ERROR).print({ 
          error: "Failed to update idea" 
        });
      }

      // Get the updated idea
      const updatedIdea = await db.collection("ideas").findOne({ 
        id: data.id, 
        userId: auth.userId 
      });

      return ctr.print({ 
        success: true, 
        idea: updatedIdea
      });
    })
);

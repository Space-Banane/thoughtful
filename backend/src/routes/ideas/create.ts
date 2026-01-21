import { db, fileRouter } from "../../";
import { authCheck } from "../../lib/Auth";

export = new fileRouter.Path("/").http(
  "POST",
  "/api/ideas/create",
  (http) =>
    http.onRequest(async (ctr) => {
      // Check authentication
      const cookie = ctr.cookies.get("thoughtful_session") || null;
      const apiHeader = (ctr.headers && ctr.headers.get)
        ? ctr.headers.get("api-authentication") || null
        : null;
      const auth = await authCheck(cookie, apiHeader);
      if (!auth.state) {
        return ctr.status(ctr.$status.UNAUTHORIZED).print({ error: auth.message });
      }

      // Validate request body
      const [data, error] = await ctr.bindBody((z) =>
        z.object({
          title: z.string().min(1).max(200),
          description: z.string().min(1).max(5000),
          tags: z.array(z.string()).max(5).default([]),
          icon: z.string().default("Lightbulb"),
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
          ).max(5).default([]),
          resources: z.array(
            z.object({
              name: z.string().min(1).max(200),
              link: z.string().url(),
            })
          ).default([]),
        })
      );

      if (!data) {
        return ctr.status(ctr.$status.BAD_REQUEST).print({ error: error.toString() });
      }

      // Create the idea
      const now = new Date();
      const id = crypto.randomUUID();
      
      const idea = {
        id,
        userId: auth.userId,
        title: data.title,
        description: data.description,
        tags: data.tags,
        icon: data.icon,
        statusId: data.statusId,
        todos: data.todos,
        resources: data.resources,
        createdAt: now,
        updatedAt: now,
      };

      const res = await db.collection("ideas").insertOne(idea);

      if (!res.acknowledged) {
        return ctr.status(ctr.$status.INTERNAL_SERVER_ERROR).print({ 
          error: "Failed to create idea" 
        });
      }

      return ctr.print({ 
        success: true, 
        idea
      });
    })
);

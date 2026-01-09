import { db, fileRouter } from "../../";
import { authCheck } from "../../lib/Auth";

export = new fileRouter.Path("/").http(
  "GET",
  "/api/account/download",
  (http) =>
    http.onRequest(async (ctr) => {
      const cookie = ctr.cookies.get("thoughtful_session") || null;
      const auth = await authCheck(cookie);

      if (!auth.state) {
        return ctr
          .status(ctr.$status.UNAUTHORIZED)
          .print({ error: auth.message });
      }

      // Fetch all user data
      const ideas = await db
        .collection("ideas")
        .find({ userId: auth.userId })
        .toArray();

      const userData = {
        user: {
          id: auth.user.id,
          username: auth.user.username,
        },
        ideas: ideas.map((idea) => ({
          id: idea.id,
          title: idea.title,
          description: idea.description,
          tags: idea.tags,
          icon: idea.icon,
          image: idea.image,
          createdAt: idea.createdAt,
          updatedAt: idea.updatedAt,
        })),
        exportedAt: new Date().toISOString(),
      };

      // Set headers for file download
      ctr.headers.set("Content-Type", "application/json");
      ctr.headers.set(
        "Content-Disposition",
        `attachment; filename="thoughtful-data-${auth.user.username}-${Date.now()}.json"`
      );

      return ctr.print(JSON.stringify(userData, null, 2));
    })
);

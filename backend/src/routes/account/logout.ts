import { db, fileRouter } from "../../";
import { authCheck } from "../../lib/Auth";

export = new fileRouter.Path("/").http(
  "POST",
  "/api/account/logout",
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

      // Delete the session from the database
      await db.collection("sessions").deleteOne({ token: cookie });

      // Clear the cookie
      ctr.cookies.delete("thoughtful_session");

      return ctr.print({ success: true, message: "Logged out successfully" });
    })
);

import { db, fileRouter } from "../../";
import { authCheck } from "../../lib/Auth";
import bcrypt from "bcryptjs";

export = new fileRouter.Path("/").http(
  "POST",
  "/api/account/delete",
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
          password: z.string().min(1),
        })
      );

      if (!data)
        return ctr.status(ctr.$status.BAD_REQUEST).print(error.toString());

      // Verify password
      const passwordMatch = await bcrypt.compare(
        data.password,
        auth.user.passwordHash
      );

      if (!passwordMatch) {
        return ctr
          .status(ctr.$status.UNAUTHORIZED)
          .print({ error: "Password is incorrect" });
      }

      // Delete all user data
      await db.collection("sessions").deleteMany({ userId: auth.userId });
      await db.collection("ideas").deleteMany({ userId: auth.userId });
      await db.collection("users").deleteOne({ id: auth.userId });

      // Clear the cookie
      ctr.cookies.delete("thoughtful_session");

      return ctr.print({
        success: true,
        message: "Account and all data deleted successfully",
      });
    })
);

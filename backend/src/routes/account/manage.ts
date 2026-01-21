import { db, fileRouter } from "../../";
import { authCheck } from "../../lib/Auth";
import bcrypt from "bcryptjs";

export = new fileRouter.Path("/").http(
  "POST",
  "/api/account/manage",
  (http) =>
    http.onRequest(async (ctr) => {
      const cookie = ctr.cookies.get("thoughtful_session") || null;
      const apiHeader = (ctr.headers && ctr.headers.get)
        ? ctr.headers.get("api-authentication") || null
        : null;
      const auth = await authCheck(cookie, apiHeader);

      if (!auth.state) {
        return ctr
          .status(ctr.$status.UNAUTHORIZED)
          .print({ error: auth.message });
      }

      const [data, error] = await ctr.bindBody((z) =>
        z.object({
          currentPassword: z.string().min(1),
          newPassword: z.string().min(6).max(200),
        })
      );

      if (!data)
        return ctr.status(ctr.$status.BAD_REQUEST).print(error.toString());

      // Verify current password
      const passwordMatch = await bcrypt.compare(
        data.currentPassword,
        auth.user.passwordHash
      );

      if (!passwordMatch) {
        return ctr
          .status(ctr.$status.UNAUTHORIZED)
          .print({ error: "Current password is incorrect" });
      }

      // Hash new password and update
      const newPasswordHash = await bcrypt.hash(data.newPassword, 10);
      const result = await db.collection("users").updateOne(
        { id: auth.userId },
        { $set: { passwordHash: newPasswordHash } }
      );

      if (result.modifiedCount === 0) {
        return ctr
          .status(ctr.$status.INTERNAL_SERVER_ERROR)
          .print({ error: "Failed to update password" });
      }

      return ctr.print({ success: true, message: "Password updated successfully" });
    })
);

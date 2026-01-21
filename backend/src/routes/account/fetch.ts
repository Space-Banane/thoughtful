import { db, fileRouter } from "../../";
import { authCheck } from "../../lib/Auth";

export = new fileRouter.Path("/").http("GET", "/api/account/fetch", (http) =>
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

    // Return user data without sensitive information
    return ctr.print({
      success: true,
      user: {
        ...auth.user,
        passwordHash: undefined, // nukes sensitive info
        statusDefinitions: auth.user.statusDefinitions || [],
      },
    });
  })
);

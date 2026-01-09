import { db } from "..";
import { Session, User } from "../types";

interface AuthCheckResultBase {
  state: boolean;
  message: string;
}

interface AuthCheckSuccess extends AuthCheckResultBase {
  state: true;
  userId: string;
  user: User;
}

interface AuthCheckFailure extends AuthCheckResultBase {
  state: false;
}

type AuthCheckResult = AuthCheckSuccess | AuthCheckFailure;

export async function authCheck(cookie: string | null): Promise<AuthCheckResult> {
  if (!cookie) {
    return { state: false, message: "No Cookie Provided" };
  }

  const session = await db.collection<Session>("sessions").findOne({ token: cookie });
  if (!session) {
    return { state: false, message: "Invalid Session" };
  }
  if (session.expiresAt < new Date()) {
    return { state: false, message: "Session Expired" };
  }
  const user = await db.collection<User>("users").findOne({ id: session.userId });
  if (!user) {
    return { state: false, message: "User Not Found" };
  }

  return {
    state: true,
    message: "Authenticated",
    userId: session.userId,
    user: user,
  };
}

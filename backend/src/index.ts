import { Server } from "rjweb-server";
import { Runtime } from "@rjweb/runtime-node";
import * as dotenv from "dotenv";
import * as mongoDB from "mongodb";
import { env } from "node:process";

dotenv.config({ path: "../.env" });

export const config = {
  CookieDomain: env.COOKIE_DOMAIN || "localhost"
}

const client: mongoDB.MongoClient = new mongoDB.MongoClient(
  env.DB_CONN_STRING!
);

const db: mongoDB.Db = client.db("thoughtful");

export { db, client };

const server = new Server(Runtime, {
  port: 8080,
});

export const fileRouter = new server.FileLoader("/")
  .load("./routes", { fileBasedRouting: false })
  .export();

server.path("/", (path) =>
  path.static("../../frontend/build/client", {
    stripHtmlEnding: true,
  })
);

server.notFound(async (ctr) => {
  return ctr
    .status(200, "maybe frontend?")
    .printFile("../../frontend/build/client/index.html", { addTypes: true });
});

server.start().then(async (port) => {
  await client.connect();

  console.log(`Server started on port ${port}!`);
});

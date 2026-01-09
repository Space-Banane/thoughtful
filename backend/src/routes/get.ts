import { db, fileRouter } from "..";

export = new fileRouter.Path("/").http("GET", "/get/{id}", (http) =>
  http.onRequest(async (ctr) => {
    const id = ctr.params.get("id");
    if (!id) {
      return ctr.status(400).print({ error: "ID parameter is required" });
    }

    const res = await db.collection("testing").findOne({ id: id });
    if (!res) {
      return ctr.status(404).print({ error: "Document not found" });
    }

    return ctr.print({ returns: res });
  })
);

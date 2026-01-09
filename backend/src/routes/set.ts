import { db, fileRouter } from "..";

export = new fileRouter.Path("/").http("POST", "/set/{id}", (http) =>
  http.onRequest(async (ctr) => {
    const id = ctr.params.get("id");
    if (!id) {
      return ctr.status(400).print({ error: "ID parameter is required" });
    }

    const [data, error] = await ctr.bindBody((z) =>
      z.object({
        value: z.any(),
      })
    );

    if (!data)
      return ctr.status(ctr.$status.BAD_REQUEST).print(error.toString());

    const res = await db.collection("testing").updateOne({ id: id }, { $set: { value: data.value } }, { upsert: true });
    if (res.modifiedCount === 0 && res.upsertedCount === 0) {
      return ctr.status(500).print({ error: "Failed to set the value" });
    }

    return ctr.print({ returns: res });
  })
);

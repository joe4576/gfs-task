import { BadRequestError } from "@/lib/errors/errors";
import { errorHandler } from "@/lib/middleware/error-handler";
import { getNormaliser } from "@/lib/normalisers/factory";
import { integrationIdSchema } from "@/lib/schemas/api";
import bodyParser from "body-parser";
import express from "express";
import z from "zod";

const app = express();

app
  .use(
    bodyParser.text({
      type: "csv",
    })
  )
  .use(bodyParser.json());

app.post("/ingest/:integrationId", async (req, res) => {
  const integrationIdParseResult = integrationIdSchema.safeParse(
    req.params.integrationId
  );

  if (!integrationIdParseResult.success) {
    throw new BadRequestError("Invalid integration ID");
  }

  const integrationId = integrationIdParseResult.data;

  const normaliser = getNormaliser(integrationId, req.body);

  const { parsedConsignments, rejectedItems } = await normaliser.normalise();

  const statusCode = rejectedItems.length > 0 ? 207 : 200;

  res.status(statusCode).json({
    data: parsedConsignments,
    errors: rejectedItems.map(({ error, item }) => ({
      item,
      error: z.treeifyError(error),
    })),
  });
});

app.use(errorHandler);

app.listen(4321, () => {
  console.log("App ready on http://localhost:4321");
});

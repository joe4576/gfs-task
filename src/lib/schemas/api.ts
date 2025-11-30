import z from "zod";

export const integrationIdSchema = z.enum(["dpd", "evri", "other"]);

export type IntegrationId = z.infer<typeof integrationIdSchema>;

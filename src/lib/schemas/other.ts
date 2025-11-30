import z from "zod";

export const otherSchema = z.object({
  id: z.coerce.string(),
  address: z.string(),
  wgt_lbs: z.string().transform((val) => parseFloat(val)),
  svc_type: z.enum(["EXPRESS"]),
  packages: z.coerce.number(),
  shipped: z.coerce.date(),
  eta: z.coerce.date(),
  current_status: z.enum(["out_for_delivery"]),
});

export type OtherSchema = z.infer<typeof otherSchema>;

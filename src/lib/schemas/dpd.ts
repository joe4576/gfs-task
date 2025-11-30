import z from "zod";

export const dpdSchema = z.object({
  "Consignment Number": z.string(),
  "Delivery Address": z.string(),
  Weight: z.string().transform((val) => parseFloat(val)),
  "Delivery Type": z.enum(["Domestic", "Business", "2 Man"]),
  "Number of parcels": z.coerce.number(),
  "Shipment Date": z.coerce.date(),
  "Delivery Date/ Expected Delivery Date": z.coerce.date(),
  Status: z.enum(["Delivered", "In Transit", "Processing", "Lost", "At Depot"]),
});

export type DpdSchema = z.infer<typeof dpdSchema>;

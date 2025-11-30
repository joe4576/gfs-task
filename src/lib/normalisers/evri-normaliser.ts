import { Normaliser, type Consignment } from "@/lib/normalisers/normaliser";
import type { CsvParser } from "@/lib/parsers/csv-parser";
import { evriSchema, type EvriSchema } from "@/lib/schemas/evri";

export class EvriNormaliser extends Normaliser<EvriSchema> {
  constructor(
    protected readonly input: unknown,
    protected readonly csvParser: CsvParser
  ) {
    super(input, csvParser, evriSchema);
  }

  mapRawSchemaToConsignment(schema: EvriSchema): Consignment {
    return {
      identifiers: {
        id: schema["Consignment Number"],
      },
      dates: {
        shipment: schema["Shipment Date"].toISOString(),
        delivery: schema["Delivery Date/ Expected Delivery Date"].toISOString(),
      },
      status: schema.Status,
      parcelCount: schema["Number of parcels"],
      weight: schema.Weight,
      deliveryType: schema["Delivery Type"],
    };
  }
}

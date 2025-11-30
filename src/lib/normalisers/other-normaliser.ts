import { Normaliser, type Consignment } from "@/lib/normalisers/normaliser";
import type { CsvParser } from "@/lib/parsers/csv-parser";
import { otherSchema, type OtherSchema } from "@/lib/schemas/other";

export class OtherNormaliser extends Normaliser<OtherSchema> {
  constructor(
    protected readonly input: unknown,
    protected readonly csvParser: CsvParser
  ) {
    super(input, csvParser, otherSchema);
  }

  mapRawSchemaToConsignment(schema: OtherSchema): Consignment {
    return {
      identifiers: {
        id: schema.id,
      },
      dates: {
        shipment: schema.shipped.toISOString(),
        delivery: schema.eta.toISOString(),
      },
      status: schema.current_status,
      parcelCount: schema.packages,
      weight: schema.wgt_lbs,
      deliveryType: schema.svc_type,
    };
  }
}

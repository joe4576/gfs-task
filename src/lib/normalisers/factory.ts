import { DpdNormaliser } from "@/lib/normalisers/dpd-normaliser";
import { EvriNormaliser } from "@/lib/normalisers/evri-normaliser";
import { OtherNormaliser } from "@/lib/normalisers/other-normaliser";
import { CsvParser } from "@/lib/parsers/csv-parser";
import type { IntegrationId } from "@/lib/schemas/api";

export function getNormaliser(
  integrationId: IntegrationId,
  input: unknown
): EvriNormaliser | DpdNormaliser | OtherNormaliser {
  const csvParser = new CsvParser();

  switch (integrationId) {
    case "evri": {
      return new EvriNormaliser(input, csvParser);
    }

    case "dpd": {
      return new DpdNormaliser(input, csvParser);
    }

    case "other": {
      return new OtherNormaliser(input, csvParser);
    }

    default: {
      throw new Error(`Unknown integration id ${integrationId}`);
    }
  }
}

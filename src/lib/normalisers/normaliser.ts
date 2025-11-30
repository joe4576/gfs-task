import { BadRequestError } from "@/lib/errors/errors";
import type { CsvParser } from "@/lib/parsers/csv-parser";
import type z from "zod";
import type { ZodError } from "zod";

export type Consignment = {
  identifiers: {
    id: string;
  };
  dates: {
    shipment: string;
    delivery: string;
  };
  status: string;
  parcelCount: number;
  weight: number;
  deliveryType: string;
};

export abstract class Normaliser<TSchema extends object> {
  constructor(
    protected readonly input: unknown,
    protected readonly csvParser: CsvParser,
    protected readonly zodSchema: z.ZodType<TSchema>
  ) {}

  abstract mapRawSchemaToConsignment(schema: TSchema): Consignment;

  private arrayValidator(items: unknown[]): {
    validatedItems: TSchema[];
    rejectedItems: { item: unknown; error: ZodError }[];
  } {
    const validatedItems: TSchema[] = [];
    const rejectedItems: { item: unknown; error: ZodError }[] = [];

    items.forEach((item) => {
      const result = this.zodSchema.safeParse(item);

      if (result.error) {
        rejectedItems.push({ item, error: result.error });
        return;
      }

      validatedItems.push(result.data);
    });

    return {
      validatedItems,
      rejectedItems,
    };
  }
  private async parseInput(input: unknown): Promise<unknown[]> {
    if (!(typeof input === "string")) {
      return Array.isArray(input) ? input : [input];
    }

    let parsedCsv: unknown[] = [];

    try {
      parsedCsv = await this.csvParser.parse(input);
    } catch (e) {
      console.error(e);
      throw new BadRequestError("Unable to parse CSV");
    }

    return parsedCsv;
  }

  public async normalise(): Promise<{
    parsedConsignments: Consignment[];
    rejectedItems: { item: unknown; error: ZodError }[];
  }> {
    const parsedInput = await this.parseInput(this.input);

    if (!parsedInput.length) {
      throw new BadRequestError("No data to ingest");
    }

    const { validatedItems, rejectedItems } = this.arrayValidator(parsedInput);

    return {
      parsedConsignments: validatedItems.map(this.mapRawSchemaToConsignment),
      rejectedItems,
    };
  }
}

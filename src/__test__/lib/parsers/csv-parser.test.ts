import { CsvParser } from "@/lib/parsers/csv-parser";
import { describe, expect, it } from "vitest";

describe("csv-parser", () => {
  it("parses a CSV", async () => {
    const csv = `Consignment Number,Delivery Address,Weight,Delivery Type,Number of parcels,Shipment Date,Delivery Date/ Expected Delivery Date,Status
73096373135242,"Studio 3 Cameron views, G7D 5LP",15.71 lb,Domestic,46,2025-05-12,2025-05-17,Delivered`;

    const csvParser = new CsvParser();

    const parsed = await csvParser.parse(csv);

    expect(parsed).toEqual([
      {
        "Consignment Number": "73096373135242",
        "Delivery Address": "Studio 3 Cameron views, G7D 5LP",
        "Delivery Date/ Expected Delivery Date": "2025-05-17",
        "Delivery Type": "Domestic",
        "Number of parcels": "46",
        "Shipment Date": "2025-05-12",
        Status: "Delivered",
        Weight: "15.71 lb",
      },
    ]);
  });

  it("throws an error when trying to parse an invalid csv", async () => {
    const csvParser = new CsvParser();

    await expect(() =>
      csvParser.parse(null as unknown as string)
    ).rejects.toThrow();
  });
});

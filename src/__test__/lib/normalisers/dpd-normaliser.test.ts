import { DpdNormaliser } from "@/lib/normalisers/dpd-normaliser";
import { CsvParser } from "@/lib/parsers/csv-parser";
import { describe, expect, it } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { ZodError } from "zod";

describe("dpd-normaliser", () => {
  it("normalises with a valid CSV input", async () => {
    const csv = `Consignment Number,Delivery Address,Weight,Delivery Type,Number of parcels,Shipment Date,Delivery Date/ Expected Delivery Date,Status
55108574873355,"Studio 07 Payne lane, HA83 4EU",9.58 lb,Domestic,30,2025-05-07,2025-05-13,Delivered`;

    const csvParser = new CsvParser();

    const normaliser = new DpdNormaliser(csv, csvParser);

    const result = await normaliser.normalise();

    expect(result).toEqual({
      parsedConsignments: [
        {
          dates: {
            delivery: "2025-05-13T00:00:00.000Z",
            shipment: "2025-05-07T00:00:00.000Z",
          },
          deliveryType: "Domestic",
          identifiers: {
            id: "55108574873355",
          },
          parcelCount: 30,
          status: "Delivered",
          weight: 9.58,
        },
      ],
      rejectedItems: [],
    });
  });

  it("normalises with a valid JSON array input", async () => {
    const json = [
      {
        "Consignment Number": "73096373135242",
        "Delivery Address": "Studio 3\nCameron views, G7D 5LP",
        Weight: "15.71 lb",
        "Delivery Type": "Domestic",
        "Number of parcels": 46,
        "Shipment Date": "2025-05-12",
        "Delivery Date/ Expected Delivery Date": "2025-05-17",
        Status: "Delivered",
      },
      {
        "Consignment Number": "61855574421989",
        "Delivery Address": "114 Taylor shore, PR4E 3NP",
        Weight: "41.61 lb",
        "Delivery Type": "Domestic",
        "Number of parcels": 32,
        "Shipment Date": "2025-04-05",
        "Delivery Date/ Expected Delivery Date": "2025-04-12",
        Status: "Delivered",
      },
    ];

    const csvParser = mockDeep<CsvParser>();

    const normaliser = new DpdNormaliser(json, csvParser);

    const result = await normaliser.normalise();

    expect(result).toEqual({
      parsedConsignments: [
        {
          dates: {
            delivery: "2025-05-17T00:00:00.000Z",
            shipment: "2025-05-12T00:00:00.000Z",
          },
          deliveryType: "Domestic",
          identifiers: {
            id: "73096373135242",
          },
          parcelCount: 46,
          status: "Delivered",
          weight: 15.71,
        },
        {
          dates: {
            delivery: "2025-04-12T00:00:00.000Z",
            shipment: "2025-04-05T00:00:00.000Z",
          },
          deliveryType: "Domestic",
          identifiers: {
            id: "61855574421989",
          },
          parcelCount: 32,
          status: "Delivered",
          weight: 41.61,
        },
      ],
      rejectedItems: [],
    });

    expect(csvParser.parse).not.toHaveBeenCalled();
  });

  it("normalises with a valid JSON object input", async () => {
    const json = {
      "Consignment Number": "73096373135242",
      "Delivery Address": "Studio 3\nCameron views, G7D 5LP",
      Weight: "15.71 lb",
      "Delivery Type": "Domestic",
      "Number of parcels": 46,
      "Shipment Date": "2025-05-12",
      "Delivery Date/ Expected Delivery Date": "2025-05-17",
      Status: "Delivered",
    };

    const csvParser = mockDeep<CsvParser>();

    const normaliser = new DpdNormaliser(json, csvParser);

    const result = await normaliser.normalise();

    expect(result).toEqual({
      parsedConsignments: [
        {
          dates: {
            delivery: "2025-05-17T00:00:00.000Z",
            shipment: "2025-05-12T00:00:00.000Z",
          },
          deliveryType: "Domestic",
          identifiers: {
            id: "73096373135242",
          },
          parcelCount: 46,
          status: "Delivered",
          weight: 15.71,
        },
      ],
      rejectedItems: [],
    });

    expect(csvParser.parse).not.toHaveBeenCalled();
  });

  it("returns a rejected item if the input does not match the schema", async () => {
    const invalidInput = {
      "Consignment Number": "73096373135242",
      "Delivery Address": "Studio 3\nCameron views, G7D 5LP",
      Weight: "15.71 lb",
      "Delivery Type": "Unknown Delivery Type",
      "Number of parcels": 46,
      "Shipment Date": "2025-05-12",
      "Delivery Date/ Expected Delivery Date": "2025-05-17",
      Status: "Delivered",
    };

    const csvParser = mockDeep<CsvParser>();

    const normaliser = new DpdNormaliser(invalidInput, csvParser);

    const result = await normaliser.normalise();

    expect(result).toEqual({
      parsedConsignments: [],
      rejectedItems: [
        {
          item: invalidInput,
          error: expect.any(ZodError),
        },
      ],
    });
  });

  it("throws if the CSV parsing fails", async () => {
    const csvParser = mockDeep<CsvParser>();

    csvParser.parse.mockRejectedValue("Unable to parse");

    const normaliser = new DpdNormaliser("", csvParser);

    await expect(() => normaliser.normalise()).rejects.toThrow(
      "Unable to parse"
    );
  });
});

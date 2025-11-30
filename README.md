# GFS Technical Task

## Setup

1. Ensure Node v24.11.1 is installed (if using `nvm`, you can run `nvm install && nvm use`)
2. Run `npm install`
3. Run `npm run dev` - this will spin up a dev server with Bun + hot reloading enabled

## Overview of my approach

I have created an Express app with a single endpoint `POST /ingest/:integrationId` where `integrationId` can be one of the following: `evri`, `dpd` or `other`.

This endpoint takes either a CSV string in the body (with header `Content-Type: text/csv`) or a JSON object/array (with header `Content-Type: application/json`).

It returns an object of shape:

```json
{
  "data": [],
  "errors": []
}
```

Where data is an array of parsed and normalised `Consignment` objects, and errors is an array of input "items" that failed to normalise, along with the reasons why.

If no items failed to normalise, the status code is 200. And if > 0 items failed to normalise, the status code is 207.

The endpoint first validates that the `:integrationId` is a valid option. It then instantiates a `Normaliser` object based off the `integrationId` (`EvriNormaliser`, `DpdNormaliser` or `OtherNormaliser`) via a factory.

Each one of these classes extends a base abstract class called `Normaliser`. This class first parses the input (i.e. determining whether it's a CSV string, JSON array or JSON object). If it's a CSV string, the string is passed to a `CsvParser`, which transforms the string into an array of objects.

For each item in the array, the item is parsed against a Zod schema that represents the shape of the expected JSON object from the external source, and returns a new object that contains the successfully parsed items, and an array of items that failed to parse, along with the error.

Once parsed, the items that match the expected schema are mapped over, converting to the required `Consignment` shape.

Each implementation of the abstract `Normalizer` class has to provide the Zod schema of the expected input shape, and the function to map that input shape to a `Consignment`.

## Assumptions I've made

1. All requests to ingest CSV will use the `Content-Type: text/csv` header
2. All requests to ingest JSON will use the `Content-Type: application/json` header
3. "other" `integrationId` supports the example JSON input in the document. "evri" and "dpd" support the example CSV files included.

## How to extend support for new integrations

1. Create a new `Normalizer` class that extends the abstract `Normalizer`
2. Create a Zod schema for the expected input shape
3. Implement the function to map from that schema to a `Consignment`
4. Extend the factory to invoke the new normaliser with the new `integrationId`

## Known limitations

1. The CSV parser library I've used does not have "strict" mode enabled. With this enabled, missing columns are not supported. This is likely leading to false positives for invalid parsing.
2. Weights are not normalised to a consistent unit
3. Invalid IDs are not handled - they are all just treated as strings.

## Future improvements

1. All known limitations addressed
2. Full test coverage, including tests for the actual API instead of just the libs
3. Improve format of validation errors - hide the fact that Zod is used.
4. Input parsing would not be done by a normaliser, this should be done in a separate layer, and the result passed to the normaliser, either through dependency injection of a parser, or by passing the result to the normaliser.

### Notes on scaling to streaming or batching

(Examples using AWS as this is what I'm most familiar with)

A Lambda function would be invoked with the raw data. It would tag it with the relevant integration ID, and put the data onto a Kinesis stream (if dealing with a continuous flow of large amounts of data, or an SQS queue if the data is not continuous). Another Lambda would be set up with an event source linked to the Kinesis stream, with relevant batching configured (ie number of events or size of batch etc).

This lambda would be responsible for parsing the input data (CSV, JSON etc) and mapping it to a JSON object. This JSON-parsed data would be put onto another stream / SQS queue.

Another lambda would be set up with an event source of the second stream / queue to do the normalisation process - parsing the results with Zod, and writing them to a data store.

If at any point a lambda fails (due to an uncaught exception, network error etc), the batch could be put onto a dead-letter queue to be re-processed again.

## AI disclosure

I used `t3.chat` for guidance on how to parse CSVs, and how best to format Zod errors. I started to implement better error formatting but ran out of time, so decided to go with a built-in approach for Zod.

I effectively used `t3.chat` as a more efficient Google (I had search mode enabled).

I did not use AI to generate, structure or refactor any code - I merely used it as a reference for the above topics.

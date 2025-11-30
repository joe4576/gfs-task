import parser from "csv-parser";
import { Readable } from "stream";

export class CsvParser {
  public async parse(csv: string): Promise<unknown[]> {
    const stringStream = Readable.from(csv);

    return new Promise((resolve, reject) => {
      const results: any[] = [];

      stringStream
        .pipe(parser())
        .on("data", (data) => results.push(data))
        .on("end", () => resolve(results))
        .on("error", (error) => reject(error));
    });
  }
}

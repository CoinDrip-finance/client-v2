import {
  BigUIntType,
  BigUIntValue,
  Field,
  FieldDefinition,
  List,
  ListType,
  Struct,
  StructType,
  U32Type,
  U32Value,
  U64Type,
  U64Value,
} from "@multiversx/sdk-core";

import { ISegment } from "../../types";

const structTypeExponent = new StructType("Exponent", [
  new FieldDefinition("numerator", "numerator", new U32Type()),
  new FieldDefinition("denominator", "denominator", new U32Type()),
]);

const structTypeSegment = new StructType("Segment", [
  new FieldDefinition("amount", "amount", new BigUIntType()),
  new FieldDefinition("exponent", "exponent", structTypeExponent),
  new FieldDefinition("duration", "duration", new U64Type()),
]);

const listTypeSegments = new ListType(structTypeSegment);

export class Segments {
  private segments: ISegment[] = [];

  constructor(segment?: ISegment) {
    if (segment) {
      this.segments.push(segment);
    }
  }

  add(segment: ISegment) {
    this.segments.push(segment);
  }

  valueOf() {
    return this.segments;
  }

  toList() {
    const segmentStructs = this.segments.map((segment) => {
      const exponent = new Struct(structTypeExponent, [
        new Field(new U32Value(segment.exponent.numerator), "numerator"),
        new Field(new U32Value(segment.exponent.denominator), "denominator"),
      ]);
      return new Struct(structTypeSegment, [
        new Field(new BigUIntValue(segment.amount), "amount"),
        new Field(exponent, "exponent"),
        new Field(new U64Value(segment.duration), "duration"),
      ]);
    });

    return new List(listTypeSegments, segmentStructs);
  }
}

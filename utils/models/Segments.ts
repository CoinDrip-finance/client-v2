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
} from '@multiversx/sdk-core';
import BigNumber from 'bignumber.js';

import { ICreateStream, ISegment } from '../../types';

BigNumber.config({ EXPONENTIAL_AT: 19 });

const structTypeSegment = new StructType("Segment", [
  new FieldDefinition("amount", "amount", new BigUIntType()),
  new FieldDefinition("exponent", "exponent", new U32Type()),
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
      return new Struct(structTypeSegment, [
        new Field(new BigUIntValue(segment.amount), "amount"),
        new Field(new U32Value(segment.exponent), "exponent"),
        new Field(new U64Value(segment.duration), "duration"),
      ]);
    });

    return new List(listTypeSegments, segmentStructs);
  }

  static fromNewStream(streamData: ICreateStream, amount: BigNumber): Segments {
    const segmentsCount: number = streamData.steps_count!;
    const segmentDuration = Math.floor(streamData.duration / segmentsCount);
    const segmentDurationError = streamData.duration - segmentDuration * segmentsCount;

    const segmentAmount = amount.div(segmentsCount).integerValue(BigNumber.ROUND_DOWN);
    const segmentAmountError = amount.minus(segmentAmount.times(segmentsCount));

    const segments = new Segments();

    for (let i = 1; i <= segmentsCount; i++) {
      segments.add({
        duration: segmentDuration - 1,
        amount: "0",
        exponent: 1,
      });

      if (i === segmentsCount) {
        segments.add({
          duration: 1 + segmentDurationError,
          amount: segmentAmount.plus(segmentAmountError).toString(),
          exponent: 1,
        });
      } else {
        segments.add({
          duration: 1,
          amount: segmentAmount.toString(),
          exponent: 1,
        });
      }
    }

    return segments;
  }
}

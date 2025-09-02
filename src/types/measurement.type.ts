type MeasurementUnit = `${number}em` | `${number}px` | 0;

export type Measurement =
  MeasurementUnit |
  `${MeasurementUnit} ${MeasurementUnit}` |
  `${MeasurementUnit} ${MeasurementUnit} ${MeasurementUnit}` |
  `${MeasurementUnit} ${MeasurementUnit} ${MeasurementUnit} ${MeasurementUnit}`;

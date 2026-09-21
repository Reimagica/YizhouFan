import {Select} from "@sanity/ui";
import {set, unset} from "sanity";
import type {NumberInputProps} from "sanity";

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;
const years = Array.from({length: MAX_YEAR - MIN_YEAR + 1}, (_, index) => MAX_YEAR - index);

export function PersonYearInput(props: NumberInputProps) {
  const {elementProps, onChange, value} = props;
  const label = "入学年份";

  return (
    <Select
      {...elementProps}
      value={value == null ? "" : String(value)}
      onChange={(event) => onChange(event.currentTarget.value ? set(Number(event.currentTarget.value)) : unset())}
    >
      <option value="">请选择{label}</option>
      {years.map((year) => <option value={year} key={year}>{year}</option>)}
    </Select>
  );
}

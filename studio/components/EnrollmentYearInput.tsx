import {Select, Text} from "@sanity/ui";
import {set} from "sanity";
import type {NumberInputProps} from "sanity";

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;
const years = Array.from({length: MAX_YEAR - MIN_YEAR + 1}, (_, index) => MAX_YEAR - index);

export function EnrollmentYearInput(props: NumberInputProps) {
  const {elementProps, onChange, value} = props;
  return <>
    <Select {...elementProps} value={value == null ? "" : String(value)} onChange={(event) => onChange(set(event.currentTarget.value ? Number(event.currentTarget.value) : undefined))}>
      <option value="">请选择入学年份</option>
      {years.map((year) => <option value={year} key={year}>{year}</option>)}
    </Select>
    <Text size={1} muted>必填，用于成员排序</Text>
  </>;
}

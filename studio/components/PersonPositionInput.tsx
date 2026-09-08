import {useEffect, useMemo} from "react";
import {Card, Stack, Text, TextInput} from "@sanity/ui";
import {set, useFormValue} from "sanity";
import type {ObjectInputProps} from "sanity";

type LocalizedPosition = {en?: string; zh?: string};
type Role = "postdoc" | "phd" | "masterToPhd" | "master" | "graduated" | "other";

const roleLabels: Record<Exclude<Role, "other">, {zh: string; en: string}> = {
  postdoc: {zh: "博士后", en: "Postdoctoral Fellow"},
  phd: {zh: "博士生", en: "Ph.D. student"},
  masterToPhd: {zh: "硕转博", en: "Master's-to-Ph.D. student"},
  master: {zh: "硕士生", en: "Master's student"},
  graduated: {zh: "已毕业", en: "Graduate"},
};

function generatedPosition(year: unknown, role: unknown): LocalizedPosition | undefined {
  if (!Number.isInteger(year) || typeof role !== "string" || role === "other" || !(role in roleLabels)) return undefined;
  const label = roleLabels[role as Exclude<Role, "other">];
  return {zh: `北京大学教育学院${year}级${label.zh}`, en: `${label.en}, Peking University Graduate School of Education, ${year}`};
}

export function PersonPositionInput(props: ObjectInputProps<LocalizedPosition>) {
  const {value, onChange} = props;
  const mode = useFormValue(["positionMode"]) as string | undefined;
  const year = useFormValue(["enrollmentYear"]);
  const role = useFormValue(["memberRole"]) as Role | undefined;
  const generated = useMemo(() => generatedPosition(year, role), [role, year]);

  useEffect(() => {
    if (mode === "other" || !generated || (value?.zh === generated.zh && value?.en === generated.en)) return;
    onChange(set(generated));
  }, [generated, mode, onChange, value?.en, value?.zh]);

  if (mode === "other") {
    return <Stack space={3}>
      <Text size={1} muted>其他身份需同时填写中文和英文身份/状态。</Text>
      <TextInput {...props.elementProps} value={value?.zh ?? ""} placeholder="中文身份/状态" onChange={(event) => onChange(set({...value, zh: event.currentTarget.value}))} />
      <TextInput {...props.elementProps} value={value?.en ?? ""} placeholder="English status" onChange={(event) => onChange(set({...value, en: event.currentTarget.value}))} />
    </Stack>;
  }

  return <Card padding={3} radius={2} tone="transparent" border><Text size={1} muted>{generated ? `${generated.zh} / ${generated.en}` : "请先选择入学年份和成员身份。"}</Text></Card>;
}

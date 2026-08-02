"use client";

import { useState } from "react";
import type { Language } from "../lib/content";
import type { PublicPerson } from "../lib/cms/types";

const categories = ["postdoc", "student", "alumni"] as const;

export function PeopleDirectory({ lang, people }: { lang: Language; people: PublicPerson[] }) {
  const zh = lang === "zh";
  const [category, setCategory] = useState<(typeof categories)[number]>("postdoc");
  const labels = {
    postdoc: zh ? "博士后" : "Postdoctoral fellows",
    student: zh ? "在读学生" : "Current students",
    alumni: zh ? "毕业生" : "Alumni",
  };
  const visible = people.filter((person) => person.category === category);

  return (
    <>
      <div className="people-tabs" aria-label={zh ? "成员分类" : "People categories"}>
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={category === item}
            className={category === item ? "active" : ""}
            onClick={() => setCategory(item)}
          >
            {labels[item]} <span>{people.filter((person) => person.category === item).length}</span>
          </button>
        ))}
      </div>
      <div className="people-grid" aria-live="polite">
        {visible.map((person) => (
          <article className="person-card" key={person.id}>
            <div
              className={person.portraitUrl ? "portrait-slot portrait-slot--image" : "portrait-slot"}
              role="img"
              aria-label={zh ? person.nameZh : person.name}
              style={person.portraitUrl ? {backgroundImage: `url(${person.portraitUrl})`} : undefined}
            >
              {!person.portraitUrl && <span>{person.name.split(" ").map((part) => part[0]).join("")}</span>}
            </div>
            <h2>{zh ? person.nameZh : person.name}</h2>
            <p>{zh ? person.statusZh : person.status}</p>
          </article>
        ))}
      </div>
    </>
  );
}

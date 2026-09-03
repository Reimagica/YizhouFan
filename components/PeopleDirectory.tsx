import Image from "next/image";
import type {Language} from "../lib/content";
import type {PublicPerson} from "../lib/cms/types";
import {sortPeople} from "../lib/people-sort";

function initialsFor(person: PublicPerson, zh: boolean) {
  const source = zh ? (person.nameZh || person.name) : person.name;
  if (!source) return "?";
  if (zh) return source.slice(0, 2);
  return source.split(/\s+/u).map((part) => part[0] ?? "").join("").slice(0, 2).toUpperCase();
}

export function PeopleDirectory({lang, people}: {lang: Language; people: PublicPerson[]}) {
  const zh = lang === "zh";
  const sorted = sortPeople(people, lang);

  if (sorted.length === 0) {
    return <p className="empty-state">{zh ? "暂无公开成员。" : "No public members yet."}</p>;
  }

  return (
    <div className="people-grid">
      {sorted.map((person) => {
        const name = zh ? (person.nameZh || person.name) : (person.name || person.nameZh);
        const position = zh ? (person.positionZh || person.position) : (person.position || person.positionZh);
        const bioSource = zh ? (person.bioZh || person.bio) : (person.bio || person.bioZh);
        const bio = bioSource?.trim() || undefined;
        const bioLabel = bio ?? (zh ? "个人与研究简介待补充" : "Profile forthcoming");
        const linkLabel = zh ? "个人主页" : "Personal page";

        return (
          <article className="person-card" key={person.id}>
            <div className="person-card__portrait">
              {person.portraitUrl
                ? <Image src={person.portraitUrl} alt={name} fill sizes="(max-width: 560px) 100vw, (max-width: 980px) 50vw, 33vw" />
                : <span className="person-card__initials" aria-hidden="true">{initialsFor(person, zh)}</span>}
            </div>
            <div className="person-card__body">
              <h2>{name}</h2>
              {position && <p className="person-card__position">{position}</p>}
              <p className={`person-card__bio${bio ? "" : " is-pending"}`}>{bioLabel}</p>
              {(person.profileUrl || person.publicEmail) && (
                <p className="person-card__links">
                  {person.profileUrl && (
                    <a href={person.profileUrl} target="_blank" rel="noopener noreferrer">{linkLabel} ↗</a>
                  )}
                  {person.publicEmail && (
                    <a href={`mailto:${person.publicEmail}`}>{person.publicEmail}</a>
                  )}
                </p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

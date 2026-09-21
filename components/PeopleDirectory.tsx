import Image from "next/image";
import type {Language} from "../lib/content";
import type {PublicPerson} from "../lib/cms/types";
import {groupPeople} from "../lib/people-sort";
import {localizedAlumniDestination, localizedPersonPosition} from "../lib/person-position";

function initialsFor(person: PublicPerson, zh: boolean) {
  const source = zh ? (person.nameZh || person.name) : person.name;
  if (!source) return "?";
  if (zh) return source.slice(0, 2);
  return source.split(/\s+/u).map((part) => part[0] ?? "").join("").slice(0, 2).toUpperCase();
}

export function PeopleDirectory({lang, people}: {lang: Language; people: PublicPerson[]}) {
  const zh = lang === "zh";

  if (people.length === 0) {
    return <p className="empty-state">{zh ? "暂无公开成员。" : "No public members yet."}</p>;
  }

  return (
    <div className="people-directory">
      {groupPeople(people, lang).map((group) => (
        <section className="people-group" key={group.category} aria-labelledby={`people-${group.category}`}>
          <div className="people-group__heading">
            <h2 id={`people-${group.category}`}>{group.label}</h2>
            <span>{group.people.length}</span>
          </div>
          {group.people.length === 0 ? (
            <p className="people-group__empty">{zh ? "暂无公开成员。" : "No public members."}</p>
          ) : (
            <div className="people-grid">
              {group.people.map((person, personIndex) => {
                const name = zh ? (person.nameZh || person.name) : (person.name || person.nameZh);
                const position = localizedPersonPosition(person, lang);
                const destination = group.category === "alumni" ? localizedAlumniDestination(person, lang) : undefined;
                const bioSource = zh ? (person.bioZh || person.bio) : (person.bio || person.bioZh);
                const bio = bioSource?.trim() || undefined;
                const bioLabel = bio ?? (zh ? "个人与研究简介待补充" : "Profile forthcoming");

                return (
                  <article className="person-card" key={person.id}>
                    <div className="person-card__portrait">
                      {person.portraitUrl
                        ? <Image
                            src={person.portraitUrl}
                            alt={name}
                            fill
                            priority={group.category === "postdoc" && personIndex === 0}
                            sizes="(max-width: 560px) 100vw, (max-width: 980px) 50vw, 33vw"
                          />
                        : <span className="person-card__initials" aria-hidden="true">{initialsFor(person, zh)}</span>}
                    </div>
                    <div className="person-card__body">
                      <h3>{name}</h3>
                      {position && <p className="person-card__position">{position}</p>}
                      {destination && (
                        <p className="person-card__destination">
                          <span>{zh ? "毕业去向" : "Destination"}</span>{destination}
                        </p>
                      )}
                      <p className={`person-card__bio${bio ? "" : " is-pending"}`}>{bioLabel}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

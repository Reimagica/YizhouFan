import type {PublicPublication} from "./cms/types";

export function publicationToBibTeX(publication: PublicPublication): string {
  if (publication.bibtex) return publication.bibtex;
  const kind = publication.kind;
  const entryType = kind === "Book" ? "book" : kind === "Book chapter" ? "incollection" : kind === "Journal article" ? "article" : "inproceedings";
  const venueField = kind === "Book" ? "publisher" : kind === "Book chapter" ? "booktitle" : kind === "Journal article" ? "journal" : "booktitle";
  const key = `Fan${publication.year}`;
  const lines = [
    `@${entryType}{${key}`,
    `  title = {${publication.title}}`,
    `  author = {${publication.authors.replaceAll(", ", " and ")}}`,
    `  ${venueField} = {${publication.venue}}`,
  ];
  if (publication.volume) lines.push(`  volume = {${publication.volume}}`);
  if (publication.issue) lines.push(`  number = {${publication.issue}}`);
  if (publication.pages) lines.push(`  pages = {${publication.pages}}`);
  if (publication.articleNumber) lines.push(`  articleno = {${publication.articleNumber}}`);
  if (publication.doi) lines.push(`  doi = {${publication.doi}}`);
  lines.push(`  year = {${publication.year}}`);
  return lines.join(",\n") + "\n}";
}

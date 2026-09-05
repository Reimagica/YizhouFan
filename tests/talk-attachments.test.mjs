import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {test} from "node:test";

test("talk attachments are direct downloads and do not create detail entries", async () => {
  const explorer = await readFile(new URL("../components/TalkExplorer.tsx", import.meta.url), "utf8");
  const detail = await readFile(new URL("../app/[lang]/talks/[id]/page.tsx", import.meta.url), "utf8");
  assert.match(explorer, /href=\{downloadUrl\(attachment\.url\)\} download/);
  assert.match(explorer, /!talk\.attachments\?\.length && !talk\.slidesUrl/);
  assert.match(detail, /if \(!talk \|\| talk\.attachments\?\.length \|\| talk\.slidesUrl\) notFound\(\)/);
});

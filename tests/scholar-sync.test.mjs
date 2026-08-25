import assert from "node:assert/strict";
import test from "node:test";
import {parseScholarAuthorResponse, reviewReason} from "../lib/server/scholar-metrics.ts";

const response = {
  search_metadata: {status: "Success"},
  search_parameters: {author_id: "EBZdbGwAAAAJ"},
  cited_by: {table: [
    {citations: {all: 3400}},
    {h_index: {all: 28}},
    {i10_index: {all: 46}},
  ]},
};

test("parses all-time metrics from a Scholar author response", () => {
  assert.deepEqual(parseScholarAuthorResponse(response), {citations: 3400, hIndex: 28, i10Index: 46});
});

test("accepts localized SerpApi metric keys", () => {
  const localized = structuredClone(response);
  localized.cited_by.table[1] = {indice_h: {all: 28}};
  localized.cited_by.table[2] = {indice_i10: {all: 46}};
  assert.deepEqual(parseScholarAuthorResponse(localized), {citations: 3400, hIndex: 28, i10Index: 46});
});

test("rejects incomplete or mismatched responses", () => {
  assert.throws(() => parseScholarAuthorResponse({search_metadata: {status: "Error"}}));
  assert.throws(() => parseScholarAuthorResponse({...response, search_parameters: {author_id: "someone-else"}}));
});

test("holds implausible metric jumps for review", () => {
  const current = {citations: 3301, hIndex: 27, i10Index: 45, asOf: "2026-06-20", sourceUrl: "https://example.com"};
  assert.equal(reviewReason(current, {citations: 3400, hIndex: 28, i10Index: 46}), undefined);
  assert.equal(reviewReason(current, {citations: 3900, hIndex: 28, i10Index: 46}), "citation_change_exceeds_limit");
});

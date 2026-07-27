import {automationState, localizedString, localizedText, privateSource, publicFile, publicationCandidate} from "./shared";
import {person} from "./person";
import {profile} from "./profile";
import {publication} from "./publication";
import {talk} from "./talk";

export const schemaTypes = [
  localizedString,
  localizedText,
  publicFile,
  privateSource,
  publicationCandidate,
  automationState,
  profile,
  publication,
  talk,
  person,
];

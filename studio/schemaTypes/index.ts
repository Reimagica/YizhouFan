import {localizedReportBody, localizedString, localizedText, publicFile, reportAttachment, reportBody, reportImage, reportNote} from "./shared";
import {person} from "./person";
import {profile} from "./profile";
import {publication} from "./publication";
import {talk} from "./talk";

export const schemaTypes = [
  localizedString,
  localizedText,
  publicFile,
  reportAttachment,
  reportImage,
  reportNote,
  reportBody,
  localizedReportBody,
  profile,
  publication,
  talk,
  person,
];

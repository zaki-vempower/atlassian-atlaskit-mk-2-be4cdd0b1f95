import { TrackAEP } from './events';
import {
  ACTION,
  ACTION_SUBJECT,
  ACTION_SUBJECT_ID,
  INPUT_METHOD,
} from './enums';
import { InsertSmartLinkAEP } from './smart-links';

export enum PANEL_TYPE {
  INFO = 'info',
  SUCCESS = 'success',
  NOTE = 'note',
  WARNING = 'warning',
  ERROR = 'error',
}

export enum USER_CONTEXT {
  EDIT = 'edit',
  NEW = 'new',
}

export enum LINK_STATUS {
  RESOLVED = 'resolved',
  UNRESOLVED = 'unresolved',
}

export enum LINK_REPRESENTATION {
  TEXT = 'text',
  INLINE_CARD = 'inlineCard',
  BLOCK_CARD = 'blockCard',
  EMBED = 'embed',
}

export enum LINK_RESOURCE {
  JIRA = 'jiraIssue',
  CONFLUENCE = 'confluencePage',
  BITBUCKET_PR = 'bitbucketPR',
  BITBUCKET_REPO = 'bitbucketRepo',
  TRELLO_CARD = 'trelloCard',
  TRELLO_BOARD = 'trelloBoard',
  STATUS_PAGE = 'statusPage',
  BOX = 'boxFile',
  DROPBOX = 'dropboxFile',
  OFFICE = 'office',
  DRIVE = 'drive',
  YOUTUBE = 'youtubeVideo',
  TWITTER = 'twitterTweet',
  OTHER = 'other',
}

export enum SELECTION_TYPE {
  CURSOR = 'cursor',
  RANGED = 'ranged',
  GAP_CURSOR = 'gapCursor',
  NODE = 'node',
  CELL = 'cell',
}

export enum SELECTION_POSITION {
  START = 'start',
  MIDDLE = 'middle',
  END = 'end',
  LEFT = 'left',
  RIGHT = 'right',
}

interface NonRequiredAttributes {
  insertLocation?: string;
  selectionType?: SELECTION_TYPE;
  selectionPosition?: SELECTION_POSITION;
}

export type InsertAEP<
  ActionSubjectID,
  Attributes,
  NonPrivacySafeAttributes
> = TrackAEP<
  ACTION.INSERTED,
  ACTION_SUBJECT.DOCUMENT,
  ActionSubjectID,
  Attributes,
  NonPrivacySafeAttributes,
  NonRequiredAttributes
>;

type InsertLineBreakAEP = TrackAEP<
  ACTION.INSERTED,
  ACTION_SUBJECT.TEXT,
  ACTION_SUBJECT_ID.LINE_BREAK,
  undefined,
  undefined
>;

type InsertDividerAEP = InsertAEP<
  ACTION_SUBJECT_ID.DIVIDER,
  {
    inputMethod:
      | INPUT_METHOD.QUICK_INSERT
      | INPUT_METHOD.TOOLBAR
      | INPUT_METHOD.INSERT_MENU
      | INPUT_METHOD.FORMATTING
      | INPUT_METHOD.SHORTCUT;
  },
  undefined
>;

type InsertPanelAEP = InsertAEP<
  ACTION_SUBJECT_ID.PANEL,
  {
    inputMethod:
      | INPUT_METHOD.QUICK_INSERT
      | INPUT_METHOD.TOOLBAR
      | INPUT_METHOD.INSERT_MENU;
    panelType:
      | PANEL_TYPE.ERROR
      | PANEL_TYPE.INFO
      | PANEL_TYPE.NOTE
      | PANEL_TYPE.SUCCESS
      | PANEL_TYPE.WARNING;
  },
  undefined
>;

type InsertCodeBlockAEP = InsertAEP<
  ACTION_SUBJECT_ID.CODE_BLOCK,
  {
    inputMethod:
      | INPUT_METHOD.QUICK_INSERT
      | INPUT_METHOD.TOOLBAR
      | INPUT_METHOD.INSERT_MENU
      | INPUT_METHOD.FORMATTING
      | INPUT_METHOD.INSERT_MENU;
  },
  undefined
>;

type InsertTableAEP = InsertAEP<
  ACTION_SUBJECT_ID.TABLE,
  {
    inputMethod:
      | INPUT_METHOD.QUICK_INSERT
      | INPUT_METHOD.TOOLBAR
      | INPUT_METHOD.INSERT_MENU
      | INPUT_METHOD.FORMATTING
      | INPUT_METHOD.SHORTCUT;
  },
  undefined
>;

type InsertExpandAEP = InsertAEP<
  ACTION_SUBJECT_ID.EXPAND | ACTION_SUBJECT_ID.NESTED_EXPAND,
  {
    inputMethod: INPUT_METHOD.QUICK_INSERT | INPUT_METHOD.INSERT_MENU;
  },
  undefined
>;

type InsertActionDecisionAEP = InsertAEP<
  ACTION_SUBJECT_ID.DECISION | ACTION_SUBJECT_ID.ACTION,
  {
    inputMethod:
      | INPUT_METHOD.QUICK_INSERT
      | INPUT_METHOD.TOOLBAR
      | INPUT_METHOD.INSERT_MENU
      | INPUT_METHOD.FORMATTING
      | INPUT_METHOD.KEYBOARD;
    containerAri?: string;
    objectAri?: string;
    localId: string;
    listLocalId: string;
    userContext?: USER_CONTEXT.EDIT | USER_CONTEXT.NEW;
    position: number;
    listSize: number;
  },
  undefined
>;

type InsertEmojiAEP = InsertAEP<
  ACTION_SUBJECT_ID.EMOJI,
  {
    inputMethod:
      | INPUT_METHOD.TYPEAHEAD
      | INPUT_METHOD.PICKER
      | INPUT_METHOD.ASCII;
  },
  undefined
>;

type InsertStatusAEP = InsertAEP<
  ACTION_SUBJECT_ID.STATUS,
  {
    inputMethod:
      | INPUT_METHOD.QUICK_INSERT
      | INPUT_METHOD.TOOLBAR
      | INPUT_METHOD.INSERT_MENU;
  },
  undefined
>;

export type InputMethodInsertMedia =
  | INPUT_METHOD.CLIPBOARD
  | INPUT_METHOD.PICKER_CLOUD
  | INPUT_METHOD.DRAG_AND_DROP;

type InsertMediaAEP = InsertAEP<
  ACTION_SUBJECT_ID.MEDIA,
  {
    inputMethod: InputMethodInsertMedia;
    fileExtension?: string;
  },
  undefined
>;

export type InputMethodInsertLink =
  | INPUT_METHOD.TYPEAHEAD
  | INPUT_METHOD.CLIPBOARD
  | INPUT_METHOD.FORMATTING
  | INPUT_METHOD.AUTO_DETECT
  | INPUT_METHOD.MANUAL;

type InsertLinkAEP = InsertAEP<
  ACTION_SUBJECT_ID.LINK,
  {
    inputMethod: InputMethodInsertLink;
  },
  {
    linkDomain: string;
  }
>;

type InsertLinkPreviewAEP = InsertAEP<
  ACTION_SUBJECT_ID.LINK_PREVIEW,
  {
    status: LINK_STATUS.RESOLVED | LINK_STATUS.UNRESOLVED;
    representation?:
      | LINK_REPRESENTATION.TEXT
      | LINK_REPRESENTATION.INLINE_CARD
      | LINK_REPRESENTATION.INLINE_CARD
      | LINK_REPRESENTATION.BLOCK_CARD;
    resourceType?:
      | LINK_RESOURCE.JIRA
      | LINK_RESOURCE.CONFLUENCE
      | LINK_RESOURCE.BITBUCKET_PR
      | LINK_RESOURCE.BITBUCKET_REPO
      | LINK_RESOURCE.TRELLO_CARD
      | LINK_RESOURCE.TRELLO_BOARD
      | LINK_RESOURCE.STATUS_PAGE
      | LINK_RESOURCE.BOX
      | LINK_RESOURCE.DROPBOX
      | LINK_RESOURCE.OFFICE
      | LINK_RESOURCE.DRIVE
      | LINK_RESOURCE.YOUTUBE
      | LINK_RESOURCE.TWITTER
      | LINK_RESOURCE.OTHER;
  },
  undefined
>;

type InsertMediaLinkAEP = InsertAEP<
  ACTION_SUBJECT_ID.MEDIA_LINK,
  {
    inputMethod: INPUT_METHOD.TYPEAHEAD | INPUT_METHOD.MANUAL;
  },
  undefined
>;

type InsertLayoutAEP = InsertAEP<
  ACTION_SUBJECT_ID.LAYOUT,
  {
    inputMethod:
      | INPUT_METHOD.TOOLBAR
      | INPUT_METHOD.INSERT_MENU
      | INPUT_METHOD.QUICK_INSERT;
  },
  undefined
>;

type InsertDateAEP = InsertAEP<
  ACTION_SUBJECT_ID.DATE,
  {
    inputMethod:
      | INPUT_METHOD.QUICK_INSERT
      | INPUT_METHOD.TOOLBAR
      | INPUT_METHOD.INSERT_MENU;
  },
  undefined
>;

export type InsertEventPayload =
  | InsertDividerAEP
  | InsertLineBreakAEP
  | InsertPanelAEP
  | InsertCodeBlockAEP
  | InsertTableAEP
  | InsertExpandAEP
  | InsertActionDecisionAEP
  | InsertEmojiAEP
  | InsertStatusAEP
  | InsertMediaAEP
  | InsertLinkAEP
  | InsertLinkPreviewAEP
  | InsertMediaLinkAEP
  | InsertSmartLinkAEP
  | InsertLayoutAEP
  | InsertDateAEP;

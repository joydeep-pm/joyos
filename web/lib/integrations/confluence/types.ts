/**
 * Confluence Integration Types
 *
 * Simplified types representing Confluence API responses.
 */

export interface ConfluenceUser {
  accountId: string;
  displayName: string;
  email?: string;
}

export interface ConfluenceVersion {
  number: number;
  when: string;
  by: ConfluenceUser;
}

export interface ConfluenceLabel {
  id: string;
  name: string;
  prefix: string;
}

export interface ConfluencePageBody {
  storage?: {
    value: string;
    representation: string;
  };
  view?: {
    value: string;
    representation: string;
  };
}

export interface ConfluencePage {
  id: string;
  type: string;
  status: string;
  title: string;
  body?: ConfluencePageBody;
  version?: ConfluenceVersion;
  space?: {
    key: string;
    name: string;
  };
  metadata?: {
    labels?: {
      results: ConfluenceLabel[];
    };
  };
  _links?: {
    webui?: string;
  };
}

export interface ConfluenceSearchResult {
  results: ConfluencePage[];
  size: number;
  start: number;
  limit: number;
}

export interface ConfluenceSpace {
  id: string;
  key: string;
  name: string;
  type: string;
}

/**
 * Normalized Confluence page for internal use
 */
export interface NormalizedConfluencePage {
  id: string;
  title: string;
  content?: string;
  spaceKey: string;
  spaceName: string;
  labels: string[];
  version: number;
  lastModified: string;
  lastModifiedBy?: {
    id: string;
    name: string;
    email?: string;
  };
  url: string;
}

export interface Recording {
  ID: number;
  RecordingID: string;
  RecordingDate: string; // ISO String
  Attributes: string; // Contains InteractionIDKey
  Direction: 'Inbound' | 'Outbound' | 'Intercom';
  FilePath: string; // Acts as the URL for playback in the web app
  FirstParticipant: string;
  OtherParticipants: string;
  DNIS: string; // Receiver/To
  ANI: string; // Caller/From
  ToConnection: string;
  FromConnection: string;
  Workgroup: string;
  Duration: number; // in seconds
  MediaType: string;
  RecordingType: string;
  FileSize: number;
  Tags: string;
}

export interface SearchFilters {
  ID: string;
  RecordingID: string;
  Attributes: string;
  AgentName: string;
  DateFrom: string;
  DateTo: string;
  DNIS: string;
  ANI: string;
  Workgroup: string;
  Direction: string;
  MediaType: string;
  RecordingType: string;
  Tags: string;
  MinDuration: string;
  MaxDuration: string;
}

export type SortField = 'RecordingDate' | 'Duration' | 'RecordingID';
export type SortOrder = 'asc' | 'desc';
import { Recording, SearchFilters } from '../types';
import { MOCK_AUDIO_URLS, MOCK_NAMES, MOCK_WORKGROUPS } from '../constants';

// Helper to generate random data
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generatePhone = () => `+1${getRandomInt(200, 999)}${getRandomInt(100, 999)}${getRandomInt(1000, 9999)}`;

const generateMockData = (count: number): Recording[] => {
  const data: Recording[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const dateObj = new Date(today);
    dateObj.setDate(today.getDate() - getRandomInt(0, 60));
    dateObj.setHours(getRandomInt(8, 20), getRandomInt(0, 59), getRandomInt(0, 59));
    
    const direction = getRandomItem(['Inbound', 'Outbound', 'Intercom'] as const);
    const agentName = getRandomItem(MOCK_NAMES);
    const customerName = getRandomItem(MOCK_NAMES);
    const agentPhone = `20${getRandomInt(10, 99)}`; // Internal extension
    const customerPhone = generatePhone();
    const interactionKey = getRandomInt(1000000000, 9999999999).toString();

    let ani = '';
    let dnis = '';
    let toConn = '';
    let fromConn = '';
    let firstPart = '';
    let otherPart = '';

    if (direction === 'Inbound') {
      ani = customerPhone;
      dnis = `1800555${getRandomInt(1000, 9999)}`; // Company toll-free
      fromConn = customerPhone;
      toConn = agentPhone;
      firstPart = `${customerName} (${customerPhone})`;
      otherPart = `${agentName} (${agentPhone})`;
    } else if (direction === 'Outbound') {
      ani = agentPhone; // Or office number
      dnis = customerPhone;
      fromConn = agentPhone;
      toConn = customerPhone;
      firstPart = `${agentName} (${agentPhone})`;
      otherPart = `${customerName} (${customerPhone})`;
    } else {
      // Intercom
      ani = agentPhone;
      dnis = `20${getRandomInt(10, 99)}`;
      fromConn = ani;
      toConn = dnis;
      firstPart = `${agentName} (${ani})`;
      otherPart = `Internal User (${dnis})`;
    }

    data.push({
      RecordingID: `REC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      RecordingDate: dateObj.toISOString(),
      Attributes: `InteractionIDKey=${interactionKey};Region=US-East;`,
      Direction: direction,
      FilePath: getRandomItem(MOCK_AUDIO_URLS),
      FirstParticipant: firstPart,
      OtherParticipants: otherPart,
      DNIS: dnis,
      ANI: ani,
      ToConnection: toConn,
      FromConnection: fromConn,
      Workgroup: getRandomItem(MOCK_WORKGROUPS),
      Duration: getRandomInt(30, 900),
    });
  }

  return data.sort((a, b) => new Date(b.RecordingDate).getTime() - new Date(a.RecordingDate).getTime());
};

const MOCK_DB = generateMockData(200);

export const searchRecordings = async (filters: SearchFilters): Promise<Recording[]> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Network delay

  return MOCK_DB.filter(rec => {
    let match = true;

    // InteractionID: Search Attributes
    if (filters.InteractionID && !rec.Attributes.toLowerCase().includes(filters.InteractionID.toLowerCase())) {
      match = false;
    }

    // Agent/User Name: Search FirstParticipant AND OtherParticipants
    if (filters.AgentName) {
      const term = filters.AgentName.toLowerCase();
      const inFirst = rec.FirstParticipant.toLowerCase().includes(term);
      const inOther = rec.OtherParticipants.toLowerCase().includes(term);
      if (!inFirst && !inOther) match = false;
    }

    // Date Range: Search RecordingDate
    if (filters.DateFrom) {
      if (new Date(rec.RecordingDate) < new Date(filters.DateFrom)) match = false;
    }
    if (filters.DateTo) {
      // Add 1 day to include the end date fully
      const toDate = new Date(filters.DateTo);
      toDate.setHours(23, 59, 59, 999);
      if (new Date(rec.RecordingDate) > toDate) match = false;
    }

    // DNIS: Search DNIS and OtherParticipants
    if (filters.DNIS) {
      const term = filters.DNIS.toLowerCase();
      const inDnis = rec.DNIS.toLowerCase().includes(term);
      const inOther = rec.OtherParticipants.toLowerCase().includes(term);
      if (!inDnis && !inOther) match = false;
    }

    // ANI: Search ANI and OtherParticipants
    if (filters.ANI) {
      const term = filters.ANI.toLowerCase();
      const inAni = rec.ANI.toLowerCase().includes(term);
      const inOther = rec.OtherParticipants.toLowerCase().includes(term);
      if (!inAni && !inOther) match = false;
    }

    // Workgroup
    if (filters.Workgroup && !rec.Workgroup.toLowerCase().includes(filters.Workgroup.toLowerCase())) {
      match = false;
    }

    // Direction
    if (filters.Direction && rec.Direction !== filters.Direction) {
      match = false;
    }

    return match;
  });
};
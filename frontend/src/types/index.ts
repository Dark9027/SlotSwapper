export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Event {
  _id: string;
  title: string;
  startTime: string; // ISO string
  endTime: string;
  status: 'BUSY' | 'SWAPPABLE' | 'SWAP_PENDING';
  userId?: string | { name: string };
}

export interface SwapRequest {
  _id: string;
  requesterUserId: { name: string };
  requesteeUserId: string;
  mySlotId: Event;
  theirSlotId: Event;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}
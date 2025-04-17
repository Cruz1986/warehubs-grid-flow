
export interface ConsignmentLog {
  id: string;
  consignment_id: string;
  source_facility: string;
  destination_facility: string;
  tote_count: number;
  status: string;
  created_by?: string;
  created_at?: string;
  completed_by?: string;
  completed_time?: string;
  received_by?: string;
  received_time?: string;
  received_count?: number;
  notes?: string;
}

export interface ToteTransaction {
  id: string;
  tote_id: string;
  source_facility: string;
  destination_facility: string;
  current_status: string;
  current_facility: string;
  consignment_id?: string;
  timestamp: string;
  operator: string;
  grid?: string;
  notes?: string;
}

export interface Consignment {
  id: string;
  source: string;
  destination: string;
  status: string;
  toteCount: number;
  createdAt: string;
  receivedCount?: number;
  receivedTime?: string;
  notes?: string;
}

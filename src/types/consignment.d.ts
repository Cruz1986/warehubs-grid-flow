
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

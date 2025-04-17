
export type ToteRegisterData = {
  tote_id: string;
  current_facility?: string | null;
  current_status?: string | null;
  activity: string;
  ib_timestamp?: string | null;
  received_by?: string | null;
  grid_no?: string | null;
  destination?: string | null;
  stagged_timestamp?: string | null;
  staged_by?: string | null;
  outbound_by?: string | null;
  ob_timestamp?: string | null;
  consignment_no?: string | null;
  source_facility?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  staged_destination?: string | null;
}

export type ToteRegisterUpdateData = Omit<Partial<ToteRegisterData>, 'tote_id'>;

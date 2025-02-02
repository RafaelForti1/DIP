export interface PoliceOfficer {
  id: string;
  rg: string;
  rank: string;
  qra: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface SignUpData {
  email: string;
  password: string;
  rg: string;
  rank: string;
  qra: string;
}

export interface SignInData {
  email: string;
  password: string;
}
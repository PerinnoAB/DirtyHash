export interface Report {
  reportString: string;
  category: ReportCategory;
  otherCategory?: string;
  url?: string;
  abuser?: string;
  description?: string;
  name?: string;
  email?: string;
}

export enum ReportCategory {
  RANSOMWARE = 'RANSOMWARE',
  SEXTORTION = 'SEXTORTION',
  DARKNETMARKET = 'DARKNETMARKET',
  CRYPTOTUMBLER = 'CRYPTOTUMBLER',
  PONZISCHEME = 'PONZISCHEME',
  BLACKMAILSCAM = 'BLACKMAILSCAM',
  SCAM = 'SCAM',
  PHISHING = 'PHISHING',
  OTHER = 'OTHER',
}

interface Currency {
  id: string;
  code: string;
  isDefault: boolean;
}

interface Rate {
  amount: number;
  currency: string;
}

interface Membership {
  userId: string;
  hourlyRate: Rate | null;
  costRate: Rate | null;
  targetId: string;
  membershipType: string;
  membershipStatus: string;
}

interface RoundSettings {
  round: string;
  minutes: string;
}

interface WorkspaceSettings {
  timeRoundingInReports: boolean;
  onlyAdminsSeeBillableRates: boolean;
  onlyAdminsCreateProject: boolean;
  onlyAdminsSeeDashboard: boolean;
  defaultBillableProjects: boolean;
  lockTimeEntries: boolean | null;
  lockTimeZone: string | null;
  round: RoundSettings;
  projectFavorites: boolean;
  canSeeTimeSheet: boolean;
  canSeeTracker: boolean;
  projectPickerSpecialFilter: boolean;
  forceProjects: boolean;
  forceTasks: boolean;
  forceTags: boolean;
  forceDescription: boolean;
  onlyAdminsSeeAllTimeEntries: boolean;
  onlyAdminsSeePublicProjectsEntries: boolean;
  trackTimeDownToSecond: boolean;
  projectGroupingLabel: string;
  adminOnlyPages: string[];
  automaticLock: boolean | null;
  onlyAdminsCreateTag: boolean;
  onlyAdminsCreateTask: boolean;
  timeTrackingMode: string;
  multiFactorEnabled: boolean;
  numberFormat: string;
  currencyFormat: string;
  durationFormat: string;
  isProjectPublicByDefault: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  hourlyRate: Rate;
  costRate: Rate;
  memberships: Membership[];
  workspaceSettings: WorkspaceSettings;
  imageUrl: string;
  featureSubscriptionType: string;
  features: string[];
  currencies: Currency[];
  subdomain: {
    name: string | null;
    enabled: boolean;
  };
}

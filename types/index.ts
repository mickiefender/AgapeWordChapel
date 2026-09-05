export type Role =
  | "super_admin"
  | "pastor"
  | "church_admin"
  | "finance_officer"
  | "department_leader"
  | "cell_leader"
  | "worker"
  | "member";

export type MemberStatus =
  | "visitor"
  | "new_convert"
  | "new_member"
  | "active_member"
  | "worker"
  | "leader"
  | "inactive";

export type MemberGender = "male" | "female" | "other";

export type MaritalStatus = "single" | "married" | "engaged" | "widowed" | "divorced" | "separated";

export type VisitorStatus = "new" | "contacted" | "follow_up" | "connected" | "joined" | "not_interested";

export type JourneyStage =
  | "visitor"
  | "follow_up"
  | "new_convert"
  | "membership_class"
  | "baptism"
  | "cell_group"
  | "department"
  | "worker"
  | "leader";

export type AttendanceType =
  | "sunday_service"
  | "midweek_service"
  | "bible_study"
  | "prayer_meeting"
  | "cell_group"
  | "department"
  | "event"
  | "children_ministry"
  | "youth_ministry";

export type PrayerPrivacy = "private" | "pastor_only" | "prayer_team" | "public";

export type PrayerStatus = "new" | "praying" | "follow_up" | "answered";

export type JoinRequestStatus = "pending" | "approved" | "declined";

export type ContactMessage = {
  id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied";
  created_at: string;
};

export type Leader = {
  id: string;
  name: string;
  position: string;
  bio: string | null;
  image_url: string | null;
  email: string | null;
  phone: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AnnouncementAudience = "everyone" | "workers" | "youth" | "department" | "cell_group" | "specific";

export type DonationType = "tithe" | "offering" | "donation" | "pledge" | "building_fund" | "missions" | "welfare" | "department_fund";

export type TransactionType = "income" | "expense";

export type AuditAction = "login" | "logout" | "create" | "update" | "delete" | "financial_transaction" | "permission_change" | "export" | "pastoral_access";

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Administrator",
  pastor: "Pastor",
  church_admin: "Church Administrator",
  finance_officer: "Finance Officer",
  department_leader: "Department Leader",
  cell_leader: "Cell Leader",
  worker: "Worker",
  member: "Member",
};

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  visitor: "Visitor",
  new_convert: "New Convert",
  new_member: "New Member",
  active_member: "Active Member",
  worker: "Worker",
  leader: "Leader",
  inactive: "Inactive",
};

export const JOURNEY_STAGE_LABELS: Record<JourneyStage, string> = {
  visitor: "Visitor",
  follow_up: "Follow-up",
  new_convert: "New Convert",
  membership_class: "Membership Class",
  baptism: "Baptism",
  cell_group: "Cell Group",
  department: "Department",
  worker: "Worker",
  leader: "Leader",
};

export const ATTENDANCE_TYPE_LABELS: Record<AttendanceType, string> = {
  sunday_service: "Sunday Service",
  midweek_service: "Midweek Service",
  bible_study: "Bible Study",
  prayer_meeting: "Prayer Meeting",
  cell_group: "Cell Group",
  department: "Department",
  event: "Event",
  children_ministry: "Children's Ministry",
  youth_ministry: "Youth Ministry",
};

export const PRAYER_STATUS_LABELS: Record<PrayerStatus, string> = {
  new: "New",
  praying: "Praying",
  follow_up: "Follow-up",
  answered: "Answered",
};

export type Profile = {
  id: string;
  user_id: string;
  role: Role;
  first_name: string;
  last_name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Member = {
  id: string;
  profile_id: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  phone: string | null;
  email: string | null;
  date_of_birth: string | null;
  gender: MemberGender | null;
  marital_status: MaritalStatus | null;
  occupation: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  membership_date: string | null;
  membership_status: MemberStatus;
  baptism_status: string | null;
  branch_location: string | null;
  notes: string | null;
  avatar_url: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Visitor = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  visit_date: string;
  service_attended: string | null;
  invited_by: string | null;
  location: string | null;
  notes: string | null;
  status: VisitorStatus;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
};

export type Department = {
  id: string;
  name: string;
  description: string | null;
  leader_id: string | null;
  image_url: string | null;
  gallery: string[];
  video_url: string | null;
  meeting_time: string | null;
  meeting_location: string | null;
  created_at: string;
  updated_at: string;
};

export type CellGroup = {
  id: string;
  name: string;
  leader_id: string | null;
  assistant_leader_id: string | null;
  meeting_location: string | null;
  meeting_day: string | null;
  meeting_time: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: string;
  name: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  facebook_live_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ServiceItem = {
  id: string;
  service_id: string;
  title: string;
  start_time: string | null;
  duration_minutes: number | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
};

export type ServiceAssignment = {
  id: string;
  service_id: string;
  member_id: string;
  role: string;
  notes: string | null;
  created_at: string;
};

export type AttendanceRecord = {
  id: string;
  member_id: string | null;
  visitor_id: string | null;
  attendance_type: AttendanceType;
  service_id: string | null;
  cell_group_id: string | null;
  department_id: string | null;
  event_id: string | null;
  check_in_time: string;
  created_at: string;
};

export type ChurchEvent = {
  id: string;
  title: string;
  description: string | null;
  event_type: string | null;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  capacity: number | null;
  registration_required: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type PrayerRequest = {
  id: string;
  member_id: string | null;
  requester_name: string | null;
  content: string;
  privacy: PrayerPrivacy;
  status: PrayerStatus;
  created_at: string;
  updated_at: string;
};

export type PastoralRecord = {
  id: string;
  member_id: string;
  record_type: string;
  notes: string;
  handled_by: string;
  created_at: string;
  updated_at: string;
};

export type Sermon = {
  id: string;
  title: string;
  speaker: string | null;
  description: string | null;
  scripture_references: string[] | null;
  categories: string[] | null;
  tags: string[] | null;
  image_url: string | null;
  audio_url: string | null;
  video_url: string | null;
  youtube_url: string | null;
  pdf_url: string | null;
  facebook_url: string | null;
  published_date: string | null;
  status: "published" | "unpublished";
  created_at: string;
  updated_at: string;
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  audience: AnnouncementAudience;
  image_url: string | null;
  video_url: string | null;
  document_url: string | null;
  publish_date: string;
  expiry_date: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: string | null;
  read: boolean;
  created_at: string;
};

export type Donation = {
  id: string;
  donor_name: string | null;
  member_id: string | null;
  donation_type: DonationType;
  amount: number;
  currency: string;
  transaction_ref: string | null;
  payment_method: string | null;
  donation_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  transaction_type: TransactionType;
  category: string;
  amount: number;
  currency: string;
  description: string | null;
  transaction_date: string;
  related_donation_id: string | null;
  created_at: string;
};

export type Expense = {
  id: string;
  category: string;
  description: string | null;
  amount: number;
  currency: string;
  expense_date: string;
  approved_by: string | null;
  created_at: string;
};

export type AuditLog = {
  id: string;
  user_id: string | null;
  action: AuditAction;
  resource: string;
  resource_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type FollowUp = {
  id: string;
  member_id: string | null;
  visitor_id: string | null;
  assigned_to: string;
  task: string;
  due_date: string | null;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
};

export type Family = {
  id: string;
  name: string;
  head_member_id: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
};

export type CellGroupReport = {
  id: string;
  cell_group_id: string;
  week_starting: string;
  total_members: number;
  present: number;
  visitors: number;
  new_converts: number;
  notes: string | null;
  submitted_by: string;
  created_at: string;
};

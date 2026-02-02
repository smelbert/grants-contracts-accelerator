// Role definitions and permissions system

export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  COACH: 'coach',
  WORKSHOP_FACILITATOR: 'workshop_facilitator',
  CONTENT_CREATOR: 'content_creator',
  COMMUNITY_MODERATOR: 'community_moderator',
  MEMBER: 'user',
};

export const ROLE_LABELS = {
  [ROLES.OWNER]: 'Owner',
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.COACH]: 'Coach',
  [ROLES.WORKSHOP_FACILITATOR]: 'Workshop Facilitator',
  [ROLES.CONTENT_CREATOR]: 'Content Creator',
  [ROLES.COMMUNITY_MODERATOR]: 'Community Moderator',
  [ROLES.MEMBER]: 'Member',
};

export const ROLE_DESCRIPTIONS = {
  [ROLES.OWNER]: 'Full platform access, billing, and system settings',
  [ROLES.ADMIN]: 'Manage content, users, and platform configuration',
  [ROLES.COACH]: 'Review documents, provide feedback, and guide organizations',
  [ROLES.WORKSHOP_FACILITATOR]: 'Create and manage workshops, events, and live sessions',
  [ROLES.CONTENT_CREATOR]: 'Create and manage learning content, templates, and resources',
  [ROLES.COMMUNITY_MODERATOR]: 'Moderate discussions, manage community spaces, and enforce guidelines',
  [ROLES.MEMBER]: 'Access learning resources, community, and tools',
};

// Granular permissions
export const PERMISSIONS = {
  // User Management
  MANAGE_USERS: 'manage_users',
  INVITE_USERS: 'invite_users',
  VIEW_USERS: 'view_users',
  
  // Content Management
  CREATE_LEARNING_CONTENT: 'create_learning_content',
  EDIT_LEARNING_CONTENT: 'edit_learning_content',
  DELETE_LEARNING_CONTENT: 'delete_learning_content',
  PUBLISH_LEARNING_CONTENT: 'publish_learning_content',
  
  // Template Management
  CREATE_TEMPLATES: 'create_templates',
  EDIT_TEMPLATES: 'edit_templates',
  DELETE_TEMPLATES: 'delete_templates',
  
  // Community Management
  MODERATE_DISCUSSIONS: 'moderate_discussions',
  PIN_POSTS: 'pin_posts',
  DELETE_POSTS: 'delete_posts',
  BAN_USERS: 'ban_users',
  MANAGE_SPACES: 'manage_spaces',
  CREATE_SPACES: 'create_spaces',
  
  // Workshop & Event Management
  CREATE_WORKSHOPS: 'create_workshops',
  MANAGE_WORKSHOPS: 'manage_workshops',
  CREATE_LIVE_ROOMS: 'create_live_rooms',
  MANAGE_REGISTRATIONS: 'manage_registrations',
  
  // Coaching & Review
  REVIEW_DOCUMENTS: 'review_documents',
  PROVIDE_FEEDBACK: 'provide_feedback',
  ASSIGN_ORGANIZATIONS: 'assign_organizations',
  CREATE_VIDEO_FEEDBACK: 'create_video_feedback',
  
  // Platform Settings
  MANAGE_BRANDING: 'manage_branding',
  MANAGE_PRICING: 'manage_pricing',
  MANAGE_INTEGRATIONS: 'manage_integrations',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_WORKFLOWS: 'manage_workflows',
  
  // Content Creation
  CREATE_BLOG_POSTS: 'create_blog_posts',
  CREATE_EMAIL_CAMPAIGNS: 'create_email_campaigns',
  
  // Organization Management
  VIEW_ALL_ORGANIZATIONS: 'view_all_organizations',
  EDIT_ORGANIZATIONS: 'edit_organizations',
};

// Role to permissions mapping
export const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: Object.values(PERMISSIONS), // All permissions
  
  [ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.INVITE_USERS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_LEARNING_CONTENT,
    PERMISSIONS.EDIT_LEARNING_CONTENT,
    PERMISSIONS.DELETE_LEARNING_CONTENT,
    PERMISSIONS.PUBLISH_LEARNING_CONTENT,
    PERMISSIONS.CREATE_TEMPLATES,
    PERMISSIONS.EDIT_TEMPLATES,
    PERMISSIONS.DELETE_TEMPLATES,
    PERMISSIONS.MODERATE_DISCUSSIONS,
    PERMISSIONS.PIN_POSTS,
    PERMISSIONS.DELETE_POSTS,
    PERMISSIONS.BAN_USERS,
    PERMISSIONS.MANAGE_SPACES,
    PERMISSIONS.CREATE_SPACES,
    PERMISSIONS.CREATE_WORKSHOPS,
    PERMISSIONS.MANAGE_WORKSHOPS,
    PERMISSIONS.CREATE_LIVE_ROOMS,
    PERMISSIONS.MANAGE_REGISTRATIONS,
    PERMISSIONS.MANAGE_BRANDING,
    PERMISSIONS.MANAGE_PRICING,
    PERMISSIONS.MANAGE_INTEGRATIONS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_WORKFLOWS,
    PERMISSIONS.CREATE_BLOG_POSTS,
    PERMISSIONS.CREATE_EMAIL_CAMPAIGNS,
    PERMISSIONS.VIEW_ALL_ORGANIZATIONS,
    PERMISSIONS.EDIT_ORGANIZATIONS,
  ],
  
  [ROLES.COACH]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.REVIEW_DOCUMENTS,
    PERMISSIONS.PROVIDE_FEEDBACK,
    PERMISSIONS.ASSIGN_ORGANIZATIONS,
    PERMISSIONS.CREATE_VIDEO_FEEDBACK,
    PERMISSIONS.CREATE_LEARNING_CONTENT,
    PERMISSIONS.EDIT_LEARNING_CONTENT,
    PERMISSIONS.CREATE_TEMPLATES,
    PERMISSIONS.EDIT_TEMPLATES,
    PERMISSIONS.VIEW_ALL_ORGANIZATIONS,
  ],
  
  [ROLES.WORKSHOP_FACILITATOR]: [
    PERMISSIONS.CREATE_WORKSHOPS,
    PERMISSIONS.MANAGE_WORKSHOPS,
    PERMISSIONS.CREATE_LIVE_ROOMS,
    PERMISSIONS.MANAGE_REGISTRATIONS,
    PERMISSIONS.CREATE_LEARNING_CONTENT,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.CREATE_EMAIL_CAMPAIGNS,
  ],
  
  [ROLES.CONTENT_CREATOR]: [
    PERMISSIONS.CREATE_LEARNING_CONTENT,
    PERMISSIONS.EDIT_LEARNING_CONTENT,
    PERMISSIONS.PUBLISH_LEARNING_CONTENT,
    PERMISSIONS.CREATE_TEMPLATES,
    PERMISSIONS.EDIT_TEMPLATES,
    PERMISSIONS.CREATE_BLOG_POSTS,
  ],
  
  [ROLES.COMMUNITY_MODERATOR]: [
    PERMISSIONS.MODERATE_DISCUSSIONS,
    PERMISSIONS.PIN_POSTS,
    PERMISSIONS.DELETE_POSTS,
    PERMISSIONS.BAN_USERS,
    PERMISSIONS.MANAGE_SPACES,
    PERMISSIONS.VIEW_USERS,
  ],
  
  [ROLES.MEMBER]: [],
};

// Helper functions
export function hasPermission(userRole, permission) {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
}

export function hasAnyPermission(userRole, permissions) {
  return permissions.some(permission => hasPermission(userRole, permission));
}

export function hasAllPermissions(userRole, permissions) {
  return permissions.every(permission => hasPermission(userRole, permission));
}

export function canAccessPage(userRole, pageName) {
  const pagePermissions = {
    AdminDashboard: [PERMISSIONS.VIEW_ANALYTICS],
    CoachDashboard: [PERMISSIONS.REVIEW_DOCUMENTS],
    SpaceManagement: [PERMISSIONS.MANAGE_SPACES],
    LiveRoomManagement: [PERMISSIONS.CREATE_LIVE_ROOMS],
    MemberManagement: [PERMISSIONS.MANAGE_USERS],
    RegistrationManagement: [PERMISSIONS.MANAGE_REGISTRATIONS],
    OrganizationsOverview: [PERMISSIONS.VIEW_ALL_ORGANIZATIONS],
    TemplateLibrary: [PERMISSIONS.CREATE_TEMPLATES, PERMISSIONS.EDIT_TEMPLATES],
    ReadinessLogic: [PERMISSIONS.MANAGE_WORKFLOWS],
    AIContentManagement: [PERMISSIONS.CREATE_LEARNING_CONTENT],
    CoachesStaff: [PERMISSIONS.MANAGE_USERS],
    CoachProfileManager: [PERMISSIONS.MANAGE_USERS],
    RegistrationBuilder: [PERMISSIONS.MANAGE_REGISTRATIONS],
    BrandingSettings: [PERMISSIONS.MANAGE_BRANDING],
    EmailHub: [PERMISSIONS.CREATE_EMAIL_CAMPAIGNS],
    WebsiteBuilder: [PERMISSIONS.CREATE_BLOG_POSTS],
    Pricing: [PERMISSIONS.MANAGE_PRICING],
    PlatformSettings: [PERMISSIONS.MANAGE_INTEGRATIONS],
    DeveloperTools: [PERMISSIONS.MANAGE_INTEGRATIONS],
    ReviewQueue: [PERMISSIONS.REVIEW_DOCUMENTS],
    AssignedOrganizations: [PERMISSIONS.ASSIGN_ORGANIZATIONS],
    VideoFeedback: [PERMISSIONS.CREATE_VIDEO_FEEDBACK],
    TeachingContent: [PERMISSIONS.CREATE_LEARNING_CONTENT],
    WorkflowsAutomation: [PERMISSIONS.MANAGE_WORKFLOWS],
  };

  const requiredPermissions = pagePermissions[pageName];
  if (!requiredPermissions) return true; // Page has no restrictions
  
  return hasAnyPermission(userRole, requiredPermissions);
}

export function getRoleColor(role) {
  const colors = {
    [ROLES.OWNER]: 'bg-purple-100 text-purple-800 border-purple-300',
    [ROLES.ADMIN]: 'bg-[#AC1A5B]/10 text-[#AC1A5B] border-[#AC1A5B]/30',
    [ROLES.COACH]: 'bg-[#1E4F58]/10 text-[#1E4F58] border-[#1E4F58]/30',
    [ROLES.WORKSHOP_FACILITATOR]: 'bg-blue-100 text-blue-800 border-blue-300',
    [ROLES.CONTENT_CREATOR]: 'bg-amber-100 text-amber-800 border-amber-300',
    [ROLES.COMMUNITY_MODERATOR]: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    [ROLES.MEMBER]: 'bg-slate-100 text-slate-800 border-slate-300',
  };
  return colors[role] || colors[ROLES.MEMBER];
}
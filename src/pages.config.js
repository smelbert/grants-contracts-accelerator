/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIContentManagement from './pages/AIContentManagement';
import AIDocumentReview from './pages/AIDocumentReview';
import AIFundingMatcher from './pages/AIFundingMatcher';
import AIGuardrails from './pages/AIGuardrails';
import AboutEIS from './pages/AboutEIS';
import AdminContentExport from './pages/AdminContentExport';
import AdminDashboard from './pages/AdminDashboard';
import AnalyzeOpportunities from './pages/AnalyzeOpportunities';
import ApplicationTracker from './pages/ApplicationTracker';
import AssessmentAnalytics from './pages/AssessmentAnalytics';
import AssessmentManagement from './pages/AssessmentManagement';
import AssessmentSurveyAdmin from './pages/AssessmentSurveyAdmin';
import AssignedOrganizations from './pages/AssignedOrganizations';
import AuditLogs from './pages/AuditLogs';
import Blog from './pages/Blog';
import BlogManagement from './pages/BlogManagement';
import BlogPost from './pages/BlogPost';
import BoilerplateBuilder from './pages/BoilerplateBuilder';
import BoutiqueServices from './pages/BoutiqueServices';
import BrandingSettings from './pages/BrandingSettings';
import BudgetBuilder from './pages/BudgetBuilder';
import Calendar from './pages/Calendar';
import CaseForSupport from './pages/CaseForSupport';
import CertificateTemplates from './pages/CertificateTemplates';
import Chat from './pages/Chat';
import CoachDashboard from './pages/CoachDashboard';
import CoachIntakeAssessment from './pages/CoachIntakeAssessment';
import CoachProfile from './pages/CoachProfile';
import CoachProfileManager from './pages/CoachProfileManager';
import CoachProfileSetup from './pages/CoachProfileSetup';
import CoachTrainingLibrary from './pages/CoachTrainingLibrary';
import CoachesStaff from './pages/CoachesStaff';
import CohortManagement from './pages/CohortManagement';
import Community from './pages/Community';
import CommunityAdmin from './pages/CommunityAdmin';
import CommunityModerationDashboard from './pages/CommunityModerationDashboard';
import ConsultantOnboarding from './pages/ConsultantOnboarding';
import DeveloperTools from './pages/DeveloperTools';
import Discussions from './pages/Discussions';
import DocumentAssembly from './pages/DocumentAssembly';
import DocumentTemplateEditor from './pages/DocumentTemplateEditor';
import Documents from './pages/Documents';
import DonorStewardshipPlanner from './pages/DonorStewardshipPlanner';
import DynamicRegistration from './pages/DynamicRegistration';
import EmailHub from './pages/EmailHub';
import EthicsCompliance from './pages/EthicsCompliance';
import EventManagement from './pages/EventManagement';
import Events from './pages/Events';
import FAQManagement from './pages/FAQManagement';
import FlagsNotes from './pages/FlagsNotes';
import FunderProfile from './pages/FunderProfile';
import FunderResearch from './pages/FunderResearch';
import FundingLane from './pages/FundingLane';
import FundingReadinessAssessment from './pages/FundingReadinessAssessment';
import GrantAssistant from './pages/GrantAssistant';
import GrantDashboard from './pages/GrantDashboard';
import GrantGlossary from './pages/GrantGlossary';
import GrantReadinessAssessment from './pages/GrantReadinessAssessment';
import GrantReadinessIntensive from './pages/GrantReadinessIntensive';
import GrantSubmission from './pages/GrantSubmission';
import GrantWritingPostAssessment from './pages/GrantWritingPostAssessment';
import GrantWritingPreAssessment from './pages/GrantWritingPreAssessment';
import Home from './pages/Home';
import IncubateHerAccessControl from './pages/IncubateHerAccessControl';
import IncubateHerAdmin from './pages/IncubateHerAdmin';
import IncubateHerAdminConsole from './pages/IncubateHerAdminConsole';
import IncubateHerAgenda from './pages/IncubateHerAgenda';
import IncubateHerAlumni from './pages/IncubateHerAlumni';
import IncubateHerAssessments from './pages/IncubateHerAssessments';
import IncubateHerAttendance from './pages/IncubateHerAttendance';
import IncubateHerCULDashboard from './pages/IncubateHerCULDashboard';
import IncubateHerCompletion from './pages/IncubateHerCompletion';
import IncubateHerConsultationGuide from './pages/IncubateHerConsultationGuide';
import IncubateHerConsultations from './pages/IncubateHerConsultations';
import IncubateHerCourse from './pages/IncubateHerCourse';
import IncubateHerDocuments from './pages/IncubateHerDocuments';
import IncubateHerEmailTemplates from './pages/IncubateHerEmailTemplates';
import IncubateHerEvaluation from './pages/IncubateHerEvaluation';
import IncubateHerEvaluationEditor from './pages/IncubateHerEvaluationEditor';
import IncubateHerFacilitatorConsole from './pages/IncubateHerFacilitatorConsole';
import IncubateHerGiveaway from './pages/IncubateHerGiveaway';
import IncubateHerGiveawayDraw from './pages/IncubateHerGiveawayDraw';
import IncubateHerLearning from './pages/IncubateHerLearning';
import IncubateHerOverview from './pages/IncubateHerOverview';
import IncubateHerParticipantWorkbooks from './pages/IncubateHerParticipantWorkbooks';
import IncubateHerParticipants from './pages/IncubateHerParticipants';
import IncubateHerPostAssessment from './pages/IncubateHerPostAssessment';
import IncubateHerPreAssessment from './pages/IncubateHerPreAssessment';
import IncubateHerProfileIntake from './pages/IncubateHerProfileIntake';
import IncubateHerProgramControl from './pages/IncubateHerProgramControl';
import IncubateHerPublic from './pages/IncubateHerPublic';
import IncubateHerReport from './pages/IncubateHerReport';
import IncubateHerSchedule from './pages/IncubateHerSchedule';
import IncubateHerVideoLibrary from './pages/IncubateHerVideoLibrary';
import IncubateHerWorkbook from './pages/IncubateHerWorkbook';
import IncubateHerWorkbookEditor from './pages/IncubateHerWorkbookEditor';
import IssuedCertificates from './pages/IssuedCertificates';
import Landing from './pages/Landing';
import Learning from './pages/Learning';
import LearningAnalytics from './pages/LearningAnalytics';
import LearningContentManagement from './pages/LearningContentManagement';
import LearningHubAccess from './pages/LearningHubAccess';
import LearningModule from './pages/LearningModule';
import LearningPathManager from './pages/LearningPathManager';
import LearningProgress from './pages/LearningProgress';
import LiveRoomManagement from './pages/LiveRoomManagement';
import LiveSessionManagement from './pages/LiveSessionManagement';
import LiveStreams from './pages/LiveStreams';
import MemberManagement from './pages/MemberManagement';
import MentorDashboard from './pages/MentorDashboard';
import MentorManagement from './pages/MentorManagement';
import MyClassroom from './pages/MyClassroom';
import MyMentorship from './pages/MyMentorship';
import MyProfile from './pages/MyProfile';
import Notifications from './pages/Notifications';
import Opportunities from './pages/Opportunities';
import OpportunitiesDirectory from './pages/OpportunitiesDirectory';
import OpportunityMatchingProfile from './pages/OpportunityMatchingProfile';
import OpportunityReports from './pages/OpportunityReports';
import OpportunityScannerAdmin from './pages/OpportunityScannerAdmin';
import OrganizationSettings from './pages/OrganizationSettings';
import OrganizationsOverview from './pages/OrganizationsOverview';
import PaymentCancelled from './pages/PaymentCancelled';
import PaymentSuccess from './pages/PaymentSuccess';
import PlatformManagement from './pages/PlatformManagement';
import PlatformSettings from './pages/PlatformSettings';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';
import ProgramAnalytics from './pages/ProgramAnalytics';
import ProgramAnnouncements from './pages/ProgramAnnouncements';
import ProgramCalendar from './pages/ProgramCalendar';
import ProgramManagement from './pages/ProgramManagement';
import ProgramMessaging from './pages/ProgramMessaging';
import ProgramModuleManager from './pages/ProgramModuleManager';
import ProjectDetail from './pages/ProjectDetail';
import Projects from './pages/Projects';
import PromotionGateConfig from './pages/PromotionGateConfig';
import ProposalWorkflowDetail from './pages/ProposalWorkflowDetail';
import ProposalWorkflows from './pages/ProposalWorkflows';
import PublicHome from './pages/PublicHome';
import RFPRapidResponse from './pages/RFPRapidResponse';
import ReadinessChecklists from './pages/ReadinessChecklists';
import ReadinessLogic from './pages/ReadinessLogic';
import ReadinessStatus from './pages/ReadinessStatus';
import Register from './pages/Register';
import RegistrationBuilder from './pages/RegistrationBuilder';
import RegistrationFlow from './pages/RegistrationFlow';
import RegistrationManagement from './pages/RegistrationManagement';
import ResourceLibrary from './pages/ResourceLibrary';
import ReviewQueue from './pages/ReviewQueue';
import RoleManagement from './pages/RoleManagement';
import SaaSAdminDashboard from './pages/SaaSAdminDashboard';
import Settings from './pages/Settings';
import SpaceManagement from './pages/SpaceManagement';
import StrategyReset from './pages/StrategyReset';
import SubscriptionPlans from './pages/SubscriptionPlans';
import SupportTickets from './pages/SupportTickets';
import TeachingContent from './pages/TeachingContent';
import TeamCollaboration from './pages/TeamCollaboration';
import TemplateLibrary from './pages/TemplateLibrary';
import Templates from './pages/Templates';
import TermsOfService from './pages/TermsOfService';
import TestimonialManagement from './pages/TestimonialManagement';
import TrainingFramework from './pages/TrainingFramework';
import TrainingFrameworkEditor from './pages/TrainingFrameworkEditor';
import TrainingLiveSessions from './pages/TrainingLiveSessions';
import TrainingPostAssessment from './pages/TrainingPostAssessment';
import TrainingPreAssessment from './pages/TrainingPreAssessment';
import UserActivityAnalytics from './pages/UserActivityAnalytics';
import UserProfile from './pages/UserProfile';
import VerifyCertificate from './pages/VerifyCertificate';
import VideoFeedback from './pages/VideoFeedback';
import WebsiteBuilder from './pages/WebsiteBuilder';
import WorkbookSectionEditor from './pages/WorkbookSectionEditor';
import WorkflowsAutomation from './pages/WorkflowsAutomation';
import GrantReadinessDashboard from './pages/GrantReadinessDashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIContentManagement": AIContentManagement,
    "AIDocumentReview": AIDocumentReview,
    "AIFundingMatcher": AIFundingMatcher,
    "AIGuardrails": AIGuardrails,
    "AboutEIS": AboutEIS,
    "AdminContentExport": AdminContentExport,
    "AdminDashboard": AdminDashboard,
    "AnalyzeOpportunities": AnalyzeOpportunities,
    "ApplicationTracker": ApplicationTracker,
    "AssessmentAnalytics": AssessmentAnalytics,
    "AssessmentManagement": AssessmentManagement,
    "AssessmentSurveyAdmin": AssessmentSurveyAdmin,
    "AssignedOrganizations": AssignedOrganizations,
    "AuditLogs": AuditLogs,
    "Blog": Blog,
    "BlogManagement": BlogManagement,
    "BlogPost": BlogPost,
    "BoilerplateBuilder": BoilerplateBuilder,
    "BoutiqueServices": BoutiqueServices,
    "BrandingSettings": BrandingSettings,
    "BudgetBuilder": BudgetBuilder,
    "Calendar": Calendar,
    "CaseForSupport": CaseForSupport,
    "CertificateTemplates": CertificateTemplates,
    "Chat": Chat,
    "CoachDashboard": CoachDashboard,
    "CoachIntakeAssessment": CoachIntakeAssessment,
    "CoachProfile": CoachProfile,
    "CoachProfileManager": CoachProfileManager,
    "CoachProfileSetup": CoachProfileSetup,
    "CoachTrainingLibrary": CoachTrainingLibrary,
    "CoachesStaff": CoachesStaff,
    "CohortManagement": CohortManagement,
    "Community": Community,
    "CommunityAdmin": CommunityAdmin,
    "CommunityModerationDashboard": CommunityModerationDashboard,
    "ConsultantOnboarding": ConsultantOnboarding,
    "DeveloperTools": DeveloperTools,
    "Discussions": Discussions,
    "DocumentAssembly": DocumentAssembly,
    "DocumentTemplateEditor": DocumentTemplateEditor,
    "Documents": Documents,
    "DonorStewardshipPlanner": DonorStewardshipPlanner,
    "DynamicRegistration": DynamicRegistration,
    "EmailHub": EmailHub,
    "EthicsCompliance": EthicsCompliance,
    "EventManagement": EventManagement,
    "Events": Events,
    "FAQManagement": FAQManagement,
    "FlagsNotes": FlagsNotes,
    "FunderProfile": FunderProfile,
    "FunderResearch": FunderResearch,
    "FundingLane": FundingLane,
    "FundingReadinessAssessment": FundingReadinessAssessment,
    "GrantAssistant": GrantAssistant,
    "GrantDashboard": GrantDashboard,
    "GrantGlossary": GrantGlossary,
    "GrantReadinessAssessment": GrantReadinessAssessment,
    "GrantReadinessIntensive": GrantReadinessIntensive,
    "GrantSubmission": GrantSubmission,
    "GrantWritingPostAssessment": GrantWritingPostAssessment,
    "GrantWritingPreAssessment": GrantWritingPreAssessment,
    "Home": Home,
    "IncubateHerAccessControl": IncubateHerAccessControl,
    "IncubateHerAdmin": IncubateHerAdmin,
    "IncubateHerAdminConsole": IncubateHerAdminConsole,
    "IncubateHerAgenda": IncubateHerAgenda,
    "IncubateHerAlumni": IncubateHerAlumni,
    "IncubateHerAssessments": IncubateHerAssessments,
    "IncubateHerAttendance": IncubateHerAttendance,
    "IncubateHerCULDashboard": IncubateHerCULDashboard,
    "IncubateHerCompletion": IncubateHerCompletion,
    "IncubateHerConsultationGuide": IncubateHerConsultationGuide,
    "IncubateHerConsultations": IncubateHerConsultations,
    "IncubateHerCourse": IncubateHerCourse,
    "IncubateHerDocuments": IncubateHerDocuments,
    "IncubateHerEmailTemplates": IncubateHerEmailTemplates,
    "IncubateHerEvaluation": IncubateHerEvaluation,
    "IncubateHerEvaluationEditor": IncubateHerEvaluationEditor,
    "IncubateHerFacilitatorConsole": IncubateHerFacilitatorConsole,
    "IncubateHerGiveaway": IncubateHerGiveaway,
    "IncubateHerGiveawayDraw": IncubateHerGiveawayDraw,
    "IncubateHerLearning": IncubateHerLearning,
    "IncubateHerOverview": IncubateHerOverview,
    "IncubateHerParticipantWorkbooks": IncubateHerParticipantWorkbooks,
    "IncubateHerParticipants": IncubateHerParticipants,
    "IncubateHerPostAssessment": IncubateHerPostAssessment,
    "IncubateHerPreAssessment": IncubateHerPreAssessment,
    "IncubateHerProfileIntake": IncubateHerProfileIntake,
    "IncubateHerProgramControl": IncubateHerProgramControl,
    "IncubateHerPublic": IncubateHerPublic,
    "IncubateHerReport": IncubateHerReport,
    "IncubateHerSchedule": IncubateHerSchedule,
    "IncubateHerVideoLibrary": IncubateHerVideoLibrary,
    "IncubateHerWorkbook": IncubateHerWorkbook,
    "IncubateHerWorkbookEditor": IncubateHerWorkbookEditor,
    "IssuedCertificates": IssuedCertificates,
    "Landing": Landing,
    "Learning": Learning,
    "LearningAnalytics": LearningAnalytics,
    "LearningContentManagement": LearningContentManagement,
    "LearningHubAccess": LearningHubAccess,
    "LearningModule": LearningModule,
    "LearningPathManager": LearningPathManager,
    "LearningProgress": LearningProgress,
    "LiveRoomManagement": LiveRoomManagement,
    "LiveSessionManagement": LiveSessionManagement,
    "LiveStreams": LiveStreams,
    "MemberManagement": MemberManagement,
    "MentorDashboard": MentorDashboard,
    "MentorManagement": MentorManagement,
    "MyClassroom": MyClassroom,
    "MyMentorship": MyMentorship,
    "MyProfile": MyProfile,
    "Notifications": Notifications,
    "Opportunities": Opportunities,
    "OpportunitiesDirectory": OpportunitiesDirectory,
    "OpportunityMatchingProfile": OpportunityMatchingProfile,
    "OpportunityReports": OpportunityReports,
    "OpportunityScannerAdmin": OpportunityScannerAdmin,
    "OrganizationSettings": OrganizationSettings,
    "OrganizationsOverview": OrganizationsOverview,
    "PaymentCancelled": PaymentCancelled,
    "PaymentSuccess": PaymentSuccess,
    "PlatformManagement": PlatformManagement,
    "PlatformSettings": PlatformSettings,
    "Pricing": Pricing,
    "Profile": Profile,
    "ProgramAnalytics": ProgramAnalytics,
    "ProgramAnnouncements": ProgramAnnouncements,
    "ProgramCalendar": ProgramCalendar,
    "ProgramManagement": ProgramManagement,
    "ProgramMessaging": ProgramMessaging,
    "ProgramModuleManager": ProgramModuleManager,
    "ProjectDetail": ProjectDetail,
    "Projects": Projects,
    "PromotionGateConfig": PromotionGateConfig,
    "ProposalWorkflowDetail": ProposalWorkflowDetail,
    "ProposalWorkflows": ProposalWorkflows,
    "PublicHome": PublicHome,
    "RFPRapidResponse": RFPRapidResponse,
    "ReadinessChecklists": ReadinessChecklists,
    "ReadinessLogic": ReadinessLogic,
    "ReadinessStatus": ReadinessStatus,
    "Register": Register,
    "RegistrationBuilder": RegistrationBuilder,
    "RegistrationFlow": RegistrationFlow,
    "RegistrationManagement": RegistrationManagement,
    "ResourceLibrary": ResourceLibrary,
    "ReviewQueue": ReviewQueue,
    "RoleManagement": RoleManagement,
    "SaaSAdminDashboard": SaaSAdminDashboard,
    "Settings": Settings,
    "SpaceManagement": SpaceManagement,
    "StrategyReset": StrategyReset,
    "SubscriptionPlans": SubscriptionPlans,
    "SupportTickets": SupportTickets,
    "TeachingContent": TeachingContent,
    "TeamCollaboration": TeamCollaboration,
    "TemplateLibrary": TemplateLibrary,
    "Templates": Templates,
    "TermsOfService": TermsOfService,
    "TestimonialManagement": TestimonialManagement,
    "TrainingFramework": TrainingFramework,
    "TrainingFrameworkEditor": TrainingFrameworkEditor,
    "TrainingLiveSessions": TrainingLiveSessions,
    "TrainingPostAssessment": TrainingPostAssessment,
    "TrainingPreAssessment": TrainingPreAssessment,
    "UserActivityAnalytics": UserActivityAnalytics,
    "UserProfile": UserProfile,
    "VerifyCertificate": VerifyCertificate,
    "VideoFeedback": VideoFeedback,
    "WebsiteBuilder": WebsiteBuilder,
    "WorkbookSectionEditor": WorkbookSectionEditor,
    "WorkflowsAutomation": WorkflowsAutomation,
    "GrantReadinessDashboard": GrantReadinessDashboard,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
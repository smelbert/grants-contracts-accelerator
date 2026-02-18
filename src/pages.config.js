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
import AdminDashboard from './pages/AdminDashboard';
import ApplicationTracker from './pages/ApplicationTracker';
import AssessmentManagement from './pages/AssessmentManagement';
import AssignedOrganizations from './pages/AssignedOrganizations';
import AuditLogs from './pages/AuditLogs';
import BoilerplateBuilder from './pages/BoilerplateBuilder';
import BoutiqueServices from './pages/BoutiqueServices';
import BrandingSettings from './pages/BrandingSettings';
import BudgetBuilder from './pages/BudgetBuilder';
import Calendar from './pages/Calendar';
import CaseForSupport from './pages/CaseForSupport';
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
import ConsultantOnboarding from './pages/ConsultantOnboarding';
import DeveloperTools from './pages/DeveloperTools';
import Discussions from './pages/Discussions';
import Documents from './pages/Documents';
import DonorStewardshipPlanner from './pages/DonorStewardshipPlanner';
import DynamicRegistration from './pages/DynamicRegistration';
import EmailHub from './pages/EmailHub';
import EthicsCompliance from './pages/EthicsCompliance';
import Events from './pages/Events';
import FAQManagement from './pages/FAQManagement';
import FlagsNotes from './pages/FlagsNotes';
import FunderProfile from './pages/FunderProfile';
import FunderResearch from './pages/FunderResearch';
import FundingLane from './pages/FundingLane';
import FundingReadinessAssessment from './pages/FundingReadinessAssessment';
import GrantDashboard from './pages/GrantDashboard';
import GrantReadinessAssessment from './pages/GrantReadinessAssessment';
import GrantReadinessIntensive from './pages/GrantReadinessIntensive';
import GrantSubmission from './pages/GrantSubmission';
import Home from './pages/Home';
import IncubateHerAdmin from './pages/IncubateHerAdmin';
import IncubateHerAdminConsole from './pages/IncubateHerAdminConsole';
import IncubateHerAgenda from './pages/IncubateHerAgenda';
import IncubateHerAssessments from './pages/IncubateHerAssessments';
import IncubateHerCULDashboard from './pages/IncubateHerCULDashboard';
import IncubateHerCompletion from './pages/IncubateHerCompletion';
import IncubateHerConsultations from './pages/IncubateHerConsultations';
import IncubateHerCourse from './pages/IncubateHerCourse';
import IncubateHerEmailTemplates from './pages/IncubateHerEmailTemplates';
import IncubateHerEvaluation from './pages/IncubateHerEvaluation';
import IncubateHerFacilitatorConsole from './pages/IncubateHerFacilitatorConsole';
import IncubateHerGiveaway from './pages/IncubateHerGiveaway';
import IncubateHerLearning from './pages/IncubateHerLearning';
import IncubateHerOverview from './pages/IncubateHerOverview';
import IncubateHerParticipantWorkbooks from './pages/IncubateHerParticipantWorkbooks';
import IncubateHerParticipants from './pages/IncubateHerParticipants';
import IncubateHerPostAssessment from './pages/IncubateHerPostAssessment';
import IncubateHerPreAssessment from './pages/IncubateHerPreAssessment';
import IncubateHerPublic from './pages/IncubateHerPublic';
import IncubateHerRegistration from './pages/IncubateHerRegistration';
import IncubateHerReport from './pages/IncubateHerReport';
import IncubateHerSchedule from './pages/IncubateHerSchedule';
import IncubateHerVideoLibrary from './pages/IncubateHerVideoLibrary';
import IncubateHerWorkbook from './pages/IncubateHerWorkbook';
import IncubateHerWorkbookEditor from './pages/IncubateHerWorkbookEditor';
import Landing from './pages/Landing';
import Learning from './pages/Learning';
import LearningContentManagement from './pages/LearningContentManagement';
import LearningHubAccess from './pages/LearningHubAccess';
import LearningModule from './pages/LearningModule';
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
import OpportunityReports from './pages/OpportunityReports';
import OrganizationSettings from './pages/OrganizationSettings';
import OrganizationsOverview from './pages/OrganizationsOverview';
import PaymentCancelled from './pages/PaymentCancelled';
import PaymentSuccess from './pages/PaymentSuccess';
import PlatformManagement from './pages/PlatformManagement';
import PlatformSettings from './pages/PlatformSettings';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';
import ProgramAnalytics from './pages/ProgramAnalytics';
import ProgramCalendar from './pages/ProgramCalendar';
import ProgramManagement from './pages/ProgramManagement';
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
import TestimonialManagement from './pages/TestimonialManagement';
import TrainingFramework from './pages/TrainingFramework';
import TrainingFrameworkEditor from './pages/TrainingFrameworkEditor';
import UserProfile from './pages/UserProfile';
import VideoFeedback from './pages/VideoFeedback';
import WebsiteBuilder from './pages/WebsiteBuilder';
import WorkbookSectionEditor from './pages/WorkbookSectionEditor';
import WorkflowsAutomation from './pages/WorkflowsAutomation';
import ProgramModuleManager from './pages/ProgramModuleManager';
import CertificateTemplates from './pages/CertificateTemplates';
import IssuedCertificates from './pages/IssuedCertificates';
import VerifyCertificate from './pages/VerifyCertificate';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIContentManagement": AIContentManagement,
    "AIDocumentReview": AIDocumentReview,
    "AIFundingMatcher": AIFundingMatcher,
    "AIGuardrails": AIGuardrails,
    "AboutEIS": AboutEIS,
    "AdminDashboard": AdminDashboard,
    "ApplicationTracker": ApplicationTracker,
    "AssessmentManagement": AssessmentManagement,
    "AssignedOrganizations": AssignedOrganizations,
    "AuditLogs": AuditLogs,
    "BoilerplateBuilder": BoilerplateBuilder,
    "BoutiqueServices": BoutiqueServices,
    "BrandingSettings": BrandingSettings,
    "BudgetBuilder": BudgetBuilder,
    "Calendar": Calendar,
    "CaseForSupport": CaseForSupport,
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
    "ConsultantOnboarding": ConsultantOnboarding,
    "DeveloperTools": DeveloperTools,
    "Discussions": Discussions,
    "Documents": Documents,
    "DonorStewardshipPlanner": DonorStewardshipPlanner,
    "DynamicRegistration": DynamicRegistration,
    "EmailHub": EmailHub,
    "EthicsCompliance": EthicsCompliance,
    "Events": Events,
    "FAQManagement": FAQManagement,
    "FlagsNotes": FlagsNotes,
    "FunderProfile": FunderProfile,
    "FunderResearch": FunderResearch,
    "FundingLane": FundingLane,
    "FundingReadinessAssessment": FundingReadinessAssessment,
    "GrantDashboard": GrantDashboard,
    "GrantReadinessAssessment": GrantReadinessAssessment,
    "GrantReadinessIntensive": GrantReadinessIntensive,
    "GrantSubmission": GrantSubmission,
    "Home": Home,
    "IncubateHerAdmin": IncubateHerAdmin,
    "IncubateHerAdminConsole": IncubateHerAdminConsole,
    "IncubateHerAgenda": IncubateHerAgenda,
    "IncubateHerAssessments": IncubateHerAssessments,
    "IncubateHerCULDashboard": IncubateHerCULDashboard,
    "IncubateHerCompletion": IncubateHerCompletion,
    "IncubateHerConsultations": IncubateHerConsultations,
    "IncubateHerCourse": IncubateHerCourse,
    "IncubateHerEmailTemplates": IncubateHerEmailTemplates,
    "IncubateHerEvaluation": IncubateHerEvaluation,
    "IncubateHerFacilitatorConsole": IncubateHerFacilitatorConsole,
    "IncubateHerGiveaway": IncubateHerGiveaway,
    "IncubateHerLearning": IncubateHerLearning,
    "IncubateHerOverview": IncubateHerOverview,
    "IncubateHerParticipantWorkbooks": IncubateHerParticipantWorkbooks,
    "IncubateHerParticipants": IncubateHerParticipants,
    "IncubateHerPostAssessment": IncubateHerPostAssessment,
    "IncubateHerPreAssessment": IncubateHerPreAssessment,
    "IncubateHerPublic": IncubateHerPublic,
    "IncubateHerRegistration": IncubateHerRegistration,
    "IncubateHerReport": IncubateHerReport,
    "IncubateHerSchedule": IncubateHerSchedule,
    "IncubateHerVideoLibrary": IncubateHerVideoLibrary,
    "IncubateHerWorkbook": IncubateHerWorkbook,
    "IncubateHerWorkbookEditor": IncubateHerWorkbookEditor,
    "Landing": Landing,
    "Learning": Learning,
    "LearningContentManagement": LearningContentManagement,
    "LearningHubAccess": LearningHubAccess,
    "LearningModule": LearningModule,
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
    "OpportunityReports": OpportunityReports,
    "OrganizationSettings": OrganizationSettings,
    "OrganizationsOverview": OrganizationsOverview,
    "PaymentCancelled": PaymentCancelled,
    "PaymentSuccess": PaymentSuccess,
    "PlatformManagement": PlatformManagement,
    "PlatformSettings": PlatformSettings,
    "Pricing": Pricing,
    "Profile": Profile,
    "ProgramAnalytics": ProgramAnalytics,
    "ProgramCalendar": ProgramCalendar,
    "ProgramManagement": ProgramManagement,
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
    "TestimonialManagement": TestimonialManagement,
    "TrainingFramework": TrainingFramework,
    "TrainingFrameworkEditor": TrainingFrameworkEditor,
    "UserProfile": UserProfile,
    "VideoFeedback": VideoFeedback,
    "WebsiteBuilder": WebsiteBuilder,
    "WorkbookSectionEditor": WorkbookSectionEditor,
    "WorkflowsAutomation": WorkflowsAutomation,
    "ProgramModuleManager": ProgramModuleManager,
    "CertificateTemplates": CertificateTemplates,
    "IssuedCertificates": IssuedCertificates,
    "VerifyCertificate": VerifyCertificate,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
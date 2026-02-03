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
import AIFundingMatcher from './pages/AIFundingMatcher';
import AIGuardrails from './pages/AIGuardrails';
import AboutEIS from './pages/AboutEIS';
import AdminDashboard from './pages/AdminDashboard';
import ApplicationTracker from './pages/ApplicationTracker';
import AssignedOrganizations from './pages/AssignedOrganizations';
import BoilerplateBuilder from './pages/BoilerplateBuilder';
import BoutiqueServices from './pages/BoutiqueServices';
import BrandingSettings from './pages/BrandingSettings';
import BudgetBuilder from './pages/BudgetBuilder';
import Calendar from './pages/Calendar';
import Chat from './pages/Chat';
import CoachDashboard from './pages/CoachDashboard';
import CoachProfile from './pages/CoachProfile';
import CoachProfileManager from './pages/CoachProfileManager';
import CoachProfileSetup from './pages/CoachProfileSetup';
import CoachesStaff from './pages/CoachesStaff';
import CohortManagement from './pages/CohortManagement';
import Community from './pages/Community';
import DeveloperTools from './pages/DeveloperTools';
import Discussions from './pages/Discussions';
import Documents from './pages/Documents';
import DynamicRegistration from './pages/DynamicRegistration';
import EmailHub from './pages/EmailHub';
import EthicsCompliance from './pages/EthicsCompliance';
import Events from './pages/Events';
import FlagsNotes from './pages/FlagsNotes';
import FunderProfile from './pages/FunderProfile';
import FundingLane from './pages/FundingLane';
import GrantDashboard from './pages/GrantDashboard';
import GrantReadinessAssessment from './pages/GrantReadinessAssessment';
import GrantReadinessIntensive from './pages/GrantReadinessIntensive';
import GrantSubmission from './pages/GrantSubmission';
import Home from './pages/Home';
import IncubateHerAdmin from './pages/IncubateHerAdmin';
import IncubateHerOverview from './pages/IncubateHerOverview';
import IncubateHerParticipants from './pages/IncubateHerParticipants';
import IncubateHerPostAssessment from './pages/IncubateHerPostAssessment';
import IncubateHerPreAssessment from './pages/IncubateHerPreAssessment';
import IncubateHerPublic from './pages/IncubateHerPublic';
import IncubateHerSchedule from './pages/IncubateHerSchedule';
import Landing from './pages/Landing';
import Learning from './pages/Learning';
import LearningHubAccess from './pages/LearningHubAccess';
import LearningModule from './pages/LearningModule';
import LearningProgress from './pages/LearningProgress';
import LiveRoomManagement from './pages/LiveRoomManagement';
import LiveStreams from './pages/LiveStreams';
import MemberManagement from './pages/MemberManagement';
import MyClassroom from './pages/MyClassroom';
import Opportunities from './pages/Opportunities';
import OrganizationSettings from './pages/OrganizationSettings';
import OrganizationsOverview from './pages/OrganizationsOverview';
import PaymentCancelled from './pages/PaymentCancelled';
import PaymentSuccess from './pages/PaymentSuccess';
import PlatformSettings from './pages/PlatformSettings';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';
import ProgramAnalytics from './pages/ProgramAnalytics';
import ProgramManagement from './pages/ProgramManagement';
import ProjectDetail from './pages/ProjectDetail';
import Projects from './pages/Projects';
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
import ReviewQueue from './pages/ReviewQueue';
import RoleManagement from './pages/RoleManagement';
import Settings from './pages/Settings';
import SpaceManagement from './pages/SpaceManagement';
import StrategyReset from './pages/StrategyReset';
import SubscriptionPlans from './pages/SubscriptionPlans';
import TeachingContent from './pages/TeachingContent';
import TeamCollaboration from './pages/TeamCollaboration';
import TemplateLibrary from './pages/TemplateLibrary';
import Templates from './pages/Templates';
import UserProfile from './pages/UserProfile';
import VideoFeedback from './pages/VideoFeedback';
import WebsiteBuilder from './pages/WebsiteBuilder';
import WorkflowsAutomation from './pages/WorkflowsAutomation';
import IncubateHerReport from './pages/IncubateHerReport';
import MentorManagement from './pages/MentorManagement';
import MentorDashboard from './pages/MentorDashboard';
import MyMentorship from './pages/MyMentorship';
import IncubateHerAgenda from './pages/IncubateHerAgenda';
import IncubateHerWorkbook from './pages/IncubateHerWorkbook';
import IncubateHerConsultations from './pages/IncubateHerConsultations';
import IncubateHerCompletion from './pages/IncubateHerCompletion';
import IncubateHerGiveaway from './pages/IncubateHerGiveaway';
import IncubateHerFacilitatorConsole from './pages/IncubateHerFacilitatorConsole';
import IncubateHerAdminConsole from './pages/IncubateHerAdminConsole';
import IncubateHerCULDashboard from './pages/IncubateHerCULDashboard';
import IncubateHerVideoLibrary from './pages/IncubateHerVideoLibrary';
import IncubateHerEmailTemplates from './pages/IncubateHerEmailTemplates';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIContentManagement": AIContentManagement,
    "AIFundingMatcher": AIFundingMatcher,
    "AIGuardrails": AIGuardrails,
    "AboutEIS": AboutEIS,
    "AdminDashboard": AdminDashboard,
    "ApplicationTracker": ApplicationTracker,
    "AssignedOrganizations": AssignedOrganizations,
    "BoilerplateBuilder": BoilerplateBuilder,
    "BoutiqueServices": BoutiqueServices,
    "BrandingSettings": BrandingSettings,
    "BudgetBuilder": BudgetBuilder,
    "Calendar": Calendar,
    "Chat": Chat,
    "CoachDashboard": CoachDashboard,
    "CoachProfile": CoachProfile,
    "CoachProfileManager": CoachProfileManager,
    "CoachProfileSetup": CoachProfileSetup,
    "CoachesStaff": CoachesStaff,
    "CohortManagement": CohortManagement,
    "Community": Community,
    "DeveloperTools": DeveloperTools,
    "Discussions": Discussions,
    "Documents": Documents,
    "DynamicRegistration": DynamicRegistration,
    "EmailHub": EmailHub,
    "EthicsCompliance": EthicsCompliance,
    "Events": Events,
    "FlagsNotes": FlagsNotes,
    "FunderProfile": FunderProfile,
    "FundingLane": FundingLane,
    "GrantDashboard": GrantDashboard,
    "GrantReadinessAssessment": GrantReadinessAssessment,
    "GrantReadinessIntensive": GrantReadinessIntensive,
    "GrantSubmission": GrantSubmission,
    "Home": Home,
    "IncubateHerAdmin": IncubateHerAdmin,
    "IncubateHerOverview": IncubateHerOverview,
    "IncubateHerParticipants": IncubateHerParticipants,
    "IncubateHerPostAssessment": IncubateHerPostAssessment,
    "IncubateHerPreAssessment": IncubateHerPreAssessment,
    "IncubateHerPublic": IncubateHerPublic,
    "IncubateHerSchedule": IncubateHerSchedule,
    "Landing": Landing,
    "Learning": Learning,
    "LearningHubAccess": LearningHubAccess,
    "LearningModule": LearningModule,
    "LearningProgress": LearningProgress,
    "LiveRoomManagement": LiveRoomManagement,
    "LiveStreams": LiveStreams,
    "MemberManagement": MemberManagement,
    "MyClassroom": MyClassroom,
    "Opportunities": Opportunities,
    "OrganizationSettings": OrganizationSettings,
    "OrganizationsOverview": OrganizationsOverview,
    "PaymentCancelled": PaymentCancelled,
    "PaymentSuccess": PaymentSuccess,
    "PlatformSettings": PlatformSettings,
    "Pricing": Pricing,
    "Profile": Profile,
    "ProgramAnalytics": ProgramAnalytics,
    "ProgramManagement": ProgramManagement,
    "ProjectDetail": ProjectDetail,
    "Projects": Projects,
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
    "ReviewQueue": ReviewQueue,
    "RoleManagement": RoleManagement,
    "Settings": Settings,
    "SpaceManagement": SpaceManagement,
    "StrategyReset": StrategyReset,
    "SubscriptionPlans": SubscriptionPlans,
    "TeachingContent": TeachingContent,
    "TeamCollaboration": TeamCollaboration,
    "TemplateLibrary": TemplateLibrary,
    "Templates": Templates,
    "UserProfile": UserProfile,
    "VideoFeedback": VideoFeedback,
    "WebsiteBuilder": WebsiteBuilder,
    "WorkflowsAutomation": WorkflowsAutomation,
    "IncubateHerReport": IncubateHerReport,
    "MentorManagement": MentorManagement,
    "MentorDashboard": MentorDashboard,
    "MyMentorship": MyMentorship,
    "IncubateHerAgenda": IncubateHerAgenda,
    "IncubateHerWorkbook": IncubateHerWorkbook,
    "IncubateHerConsultations": IncubateHerConsultations,
    "IncubateHerCompletion": IncubateHerCompletion,
    "IncubateHerGiveaway": IncubateHerGiveaway,
    "IncubateHerFacilitatorConsole": IncubateHerFacilitatorConsole,
    "IncubateHerAdminConsole": IncubateHerAdminConsole,
    "IncubateHerCULDashboard": IncubateHerCULDashboard,
    "IncubateHerVideoLibrary": IncubateHerVideoLibrary,
    "IncubateHerEmailTemplates": IncubateHerEmailTemplates,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
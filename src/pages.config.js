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
import AdminDashboard from './pages/AdminDashboard';
import ApplicationTracker from './pages/ApplicationTracker';
import AssignedOrganizations from './pages/AssignedOrganizations';
import BoilerplateBuilder from './pages/BoilerplateBuilder';
import BudgetBuilder from './pages/BudgetBuilder';
import CoachDashboard from './pages/CoachDashboard';
import CoachProfile from './pages/CoachProfile';
import CoachProfileManager from './pages/CoachProfileManager';
import CoachProfileSetup from './pages/CoachProfileSetup';
import CoachesStaff from './pages/CoachesStaff';
import Community from './pages/Community';
import Documents from './pages/Documents';
import EthicsCompliance from './pages/EthicsCompliance';
import FlagsNotes from './pages/FlagsNotes';
import FunderProfile from './pages/FunderProfile';
import FundingLane from './pages/FundingLane';
import GrantDashboard from './pages/GrantDashboard';
import GrantReadinessAssessment from './pages/GrantReadinessAssessment';
import GrantSubmission from './pages/GrantSubmission';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Learning from './pages/Learning';
import LearningModule from './pages/LearningModule';
import LearningProgress from './pages/LearningProgress';
import Opportunities from './pages/Opportunities';
import OrganizationSettings from './pages/OrganizationSettings';
import OrganizationsOverview from './pages/OrganizationsOverview';
import PlatformSettings from './pages/PlatformSettings';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';
import ProjectDetail from './pages/ProjectDetail';
import Projects from './pages/Projects';
import ProposalWorkflowDetail from './pages/ProposalWorkflowDetail';
import ProposalWorkflows from './pages/ProposalWorkflows';
import ReadinessChecklists from './pages/ReadinessChecklists';
import ReadinessLogic from './pages/ReadinessLogic';
import ReadinessStatus from './pages/ReadinessStatus';
import ReviewQueue from './pages/ReviewQueue';
import Settings from './pages/Settings';
import TeachingContent from './pages/TeachingContent';
import TeamCollaboration from './pages/TeamCollaboration';
import TemplateLibrary from './pages/TemplateLibrary';
import Templates from './pages/Templates';
import VideoFeedback from './pages/VideoFeedback';
import EmailHub from './pages/EmailHub';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIContentManagement": AIContentManagement,
    "AIFundingMatcher": AIFundingMatcher,
    "AIGuardrails": AIGuardrails,
    "AdminDashboard": AdminDashboard,
    "ApplicationTracker": ApplicationTracker,
    "AssignedOrganizations": AssignedOrganizations,
    "BoilerplateBuilder": BoilerplateBuilder,
    "BudgetBuilder": BudgetBuilder,
    "CoachDashboard": CoachDashboard,
    "CoachProfile": CoachProfile,
    "CoachProfileManager": CoachProfileManager,
    "CoachProfileSetup": CoachProfileSetup,
    "CoachesStaff": CoachesStaff,
    "Community": Community,
    "Documents": Documents,
    "EthicsCompliance": EthicsCompliance,
    "FlagsNotes": FlagsNotes,
    "FunderProfile": FunderProfile,
    "FundingLane": FundingLane,
    "GrantDashboard": GrantDashboard,
    "GrantReadinessAssessment": GrantReadinessAssessment,
    "GrantSubmission": GrantSubmission,
    "Home": Home,
    "Landing": Landing,
    "Learning": Learning,
    "LearningModule": LearningModule,
    "LearningProgress": LearningProgress,
    "Opportunities": Opportunities,
    "OrganizationSettings": OrganizationSettings,
    "OrganizationsOverview": OrganizationsOverview,
    "PlatformSettings": PlatformSettings,
    "Pricing": Pricing,
    "Profile": Profile,
    "ProjectDetail": ProjectDetail,
    "Projects": Projects,
    "ProposalWorkflowDetail": ProposalWorkflowDetail,
    "ProposalWorkflows": ProposalWorkflows,
    "ReadinessChecklists": ReadinessChecklists,
    "ReadinessLogic": ReadinessLogic,
    "ReadinessStatus": ReadinessStatus,
    "ReviewQueue": ReviewQueue,
    "Settings": Settings,
    "TeachingContent": TeachingContent,
    "TeamCollaboration": TeamCollaboration,
    "TemplateLibrary": TemplateLibrary,
    "Templates": Templates,
    "VideoFeedback": VideoFeedback,
    "EmailHub": EmailHub,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
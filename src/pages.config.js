import AdminDashboard from './pages/AdminDashboard';
import BoilerplateBuilder from './pages/BoilerplateBuilder';
import CoachDashboard from './pages/CoachDashboard';
import CoachProfileSetup from './pages/CoachProfileSetup';
import Community from './pages/Community';
import Documents from './pages/Documents';
import FundingLane from './pages/FundingLane';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Learning from './pages/Learning';
import Opportunities from './pages/Opportunities';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Templates from './pages/Templates';
import ReadinessChecklists from './pages/ReadinessChecklists';
import ReadinessStatus from './pages/ReadinessStatus';
import AssignedOrganizations from './pages/AssignedOrganizations';
import ReviewQueue from './pages/ReviewQueue';
import VideoFeedback from './pages/VideoFeedback';
import TeachingContent from './pages/TeachingContent';
import FlagsNotes from './pages/FlagsNotes';
import OrganizationsOverview from './pages/OrganizationsOverview';
import ReadinessLogic from './pages/ReadinessLogic';
import TemplateLibrary from './pages/TemplateLibrary';
import AIGuardrails from './pages/AIGuardrails';
import CoachesStaff from './pages/CoachesStaff';
import Pricing from './pages/Pricing';
import EthicsCompliance from './pages/EthicsCompliance';
import PlatformSettings from './pages/PlatformSettings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminDashboard": AdminDashboard,
    "BoilerplateBuilder": BoilerplateBuilder,
    "CoachDashboard": CoachDashboard,
    "CoachProfileSetup": CoachProfileSetup,
    "Community": Community,
    "Documents": Documents,
    "FundingLane": FundingLane,
    "Home": Home,
    "Landing": Landing,
    "Learning": Learning,
    "Opportunities": Opportunities,
    "Profile": Profile,
    "Settings": Settings,
    "Templates": Templates,
    "ReadinessChecklists": ReadinessChecklists,
    "ReadinessStatus": ReadinessStatus,
    "AssignedOrganizations": AssignedOrganizations,
    "ReviewQueue": ReviewQueue,
    "VideoFeedback": VideoFeedback,
    "TeachingContent": TeachingContent,
    "FlagsNotes": FlagsNotes,
    "OrganizationsOverview": OrganizationsOverview,
    "ReadinessLogic": ReadinessLogic,
    "TemplateLibrary": TemplateLibrary,
    "AIGuardrails": AIGuardrails,
    "CoachesStaff": CoachesStaff,
    "Pricing": Pricing,
    "EthicsCompliance": EthicsCompliance,
    "PlatformSettings": PlatformSettings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
import AdminDashboard from './pages/AdminDashboard';
import BoilerplateBuilder from './pages/BoilerplateBuilder';
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
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminDashboard": AdminDashboard,
    "BoilerplateBuilder": BoilerplateBuilder,
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
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
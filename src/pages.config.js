import Home from './pages/Home';
import Opportunities from './pages/Opportunities';
import BoilerplateBuilder from './pages/BoilerplateBuilder';
import Learning from './pages/Learning';
import Community from './pages/Community';
import FundingLane from './pages/FundingLane';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import Documents from './pages/Documents';
import CoachProfileSetup from './pages/CoachProfileSetup';
import AdminDashboard from './pages/AdminDashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Opportunities": Opportunities,
    "BoilerplateBuilder": BoilerplateBuilder,
    "Learning": Learning,
    "Community": Community,
    "FundingLane": FundingLane,
    "Profile": Profile,
    "Settings": Settings,
    "Landing": Landing,
    "Documents": Documents,
    "CoachProfileSetup": CoachProfileSetup,
    "AdminDashboard": AdminDashboard,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
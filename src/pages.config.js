import Home from './pages/Home';
import Opportunities from './pages/Opportunities';
import BoilerplateBuilder from './pages/BoilerplateBuilder';
import Learning from './pages/Learning';
import Community from './pages/Community';
import FundingLane from './pages/FundingLane';
import Profile from './pages/Profile';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Opportunities": Opportunities,
    "BoilerplateBuilder": BoilerplateBuilder,
    "Learning": Learning,
    "Community": Community,
    "FundingLane": FundingLane,
    "Profile": Profile,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
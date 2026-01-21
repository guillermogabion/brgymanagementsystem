import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import UsersList from "./pages/Users/UsersPage";
import ResidentsPage from "./pages/Resident/ResidentPage";
import ResidentsForm from "./pages/Resident/ResidentForm";
import TemplateRenderer from "./pages/Templates/TemplateRenderer";
import DocumentsPage from "./pages/Document/DocumentPage";
import DocumentDesigner from "./pages/Document/DocumentDesigner";
import PrintPreview from "./pages/PrintPreview/PrintPreview";
import DefaultLayout from "./layout/DefaultLayout";
export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route path="/TailAdmin/" element={<AppLayout />}>
            <Route index element={<Home />} />

            {/* Others Page */}

            {/* users  */}
            <Route path="users" element={<UsersList />} />

            {/* residents  */}
            <Route path="residents">
              {/* This is the main list: /TailAdmin/residents */}
              <Route index element={<ResidentsPage />} /> 
              <Route path="edit/:id" element={<ResidentsForm />} />
              
              {/* This is the form: /TailAdmin/residents/add */}
              <Route path="add" element={<ResidentsForm />} />
            </Route>

            <Route path="documents">
              <Route index element={<DocumentsPage />} /> 
              <Route path="add" element={<DocumentDesigner />} /> 
              <Route path="edit/:id" element={<DocumentDesigner />} /> 
            </Route>
            <Route path="profile" element={<UserProfiles />} />
            <Route path="templaterenderer" element={<TemplateRenderer />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="blank" element={<Blank />} />

            {/* Forms */}
            <Route path="form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="alerts" element={<Alerts />} />
            <Route path="avatars" element={<Avatars />} />
            <Route path="badge" element={<Badges />} />
            <Route path="buttons" element={<Buttons />} />
            <Route path="images" element={<Images />} />
            <Route path="videos" element={<Videos />} />

            {/* Charts */}
            <Route path="line-chart" element={<LineChart />} />
            <Route path="bar-chart" element={<BarChart />} />
          </Route>

          <Route path="/TailAdmin/documents/print/:templateId/:residentId" element={<PrintPreview />} />


          {/* Auth Layo ut */}
          <Route path="/TailAdmin/signin" element={<SignIn />} />
          <Route path="/TailAdmin/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

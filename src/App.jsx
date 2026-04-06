import { Routes, Route } from "react-router-dom";
import Landing   from "./Pages/landing";
import Login     from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Admin     from "./Pages/Admin";
import Results   from "./Pages/Results";

function App() {
  return (
    <Routes>
      <Route path="/"          element={<Landing />}   />
      <Route path="/login"     element={<Login />}     />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin"     element={<Admin />}     />
      <Route path="/results"   element={<Results />}   />
    </Routes>
  );
}

export default App;
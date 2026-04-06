import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div className="bg-forestDark text-white px-6 py-4 flex justify-between items-center shadow-card">
      
      <h1 className="text-xl font-bold text-gold">
        🌿 Forest E-Voting
      </h1>

      <div className="flex gap-6">
        <Link to="/" className="hover:text-gold">Home</Link>
        <Link to="/dashboard" className="hover:text-gold">Dashboard</Link>
        <Link to="/admin" className="hover:text-gold">Admin</Link>
        <Link to="/results" className="hover:text-gold">Results</Link>
      </div>
    </div>
  );
}

export default Navbar;
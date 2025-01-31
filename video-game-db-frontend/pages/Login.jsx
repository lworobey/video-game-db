import './login.css';
import { NavLink } from "react-router";

const Login = () => {
return(
    <div className="Login container">
    <h1>This is the Login page</h1>
          <div className="login-container">
            <button 
              type="button" 
              className="login-button"
              onClick={() => window.location.href = 'http://localhost:3000/auth/login'}
            >
              Login with Discord
            </button>
          </div>

    </div>);
};
export default Login
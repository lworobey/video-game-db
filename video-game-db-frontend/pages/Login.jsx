import './login.css';
import { NavLink } from "react-router";

const Login = () => {
return(
    <div className="Login container">
    <h1>This is the Login page</h1>
    <input
      type="text" 
      placeholder="login"
      className="login-input"
    />
    <input
      type="text" 
      placeholder="Password"
      className="password-input"
    />
          <div className="login-container">
            <NavLink to="." ></NavLink>
          </div>

    </div>
    );
};
export default Login
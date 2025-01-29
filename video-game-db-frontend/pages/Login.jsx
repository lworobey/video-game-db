import {useNavigate} from "react-router-dom";

const Login = () => {
return(
    <div className="Login container">
        <h1>This is the Login page</h1>
    <input
      type="text" 
      placeholder="login"
      className="login-input"
    />
    </div>
    );
};
export default Login
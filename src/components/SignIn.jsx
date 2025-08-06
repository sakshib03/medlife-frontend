import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./css_files/SignIn.css";
import sidelogo from "../assets/signup.png";
import medlife from "../assets/v987-18a-removebg-preview.png";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const dummyCredentials = {
    username: "testuser",
    password: "test123",
    email: "test@example.com",
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Check against dummy credentials
      if (
        username === dummyCredentials.username &&
        password === dummyCredentials.password
      ) {
        localStorage.setItem("userEmail", dummyCredentials.email);
        localStorage.setItem("showDisclaimer", "true");

        toast.success("Login successful! ", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          draggable: true,
          progress: undefined,
          onClose: () => {
            window.location.href = "/disclaimer";
          },
        });
      } else {
        toast.error("Invalid username or password.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <div className="background-content">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <header>
        <div className="header-left">
          <img src={medlife} alt="MedLife AI Logo" className="logo" />
          <div>
            <h1 className="title">MedLife AI</h1>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="form-container">
          <h1>Sign In to Medlife.ai</h1>
          <p style={{ color: "#6b6a6a" }}>
            Sign In to Medlife.ai to continue to Application
          </p>
          <form onSubmit={handleSubmit}>
            <br />
            <label
              htmlFor="username"
              style={{ color: "gray", fontSize: "14px" }}
            >
              User Name or Email
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <div style={{ position: "relative" }}>
              <label
                htmlFor="password"
                style={{ color: "gray", fontSize: "14px" }}
              >
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: "30px" }} // Add padding to prevent text under the icon
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "38px", // Adjust based on your layout
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "gray",
                }}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            <a style={{ color: "blue" }} className="forgot">
              Forgot password
            </a>
            <button type="submit" className="sign-in-btn">
              Sign In
            </button>

            {errorMessage && (
              <p className="error-message" style={{ display: "block" }}>
                {errorMessage}
              </p>
            )}

            <p style={{ color: "gray" }}>
              Don't have an account?{" "}
              <a
                style={{ color: "blue" }}
                className="sign-up"
                onClick={() => {
                  navigate("/signup");
                }}
              >
                Sign Up
              </a>
            </p>

            <button type="button" className="google-btn">
              Continue with Google
            </button>

            <p>
              By continuing, you agree to the Terms of use and Privacy Policy
            </p>
          </form>
        </div>

        <div className="illustration">
          <img src={sidelogo} alt="Doctor Illustration" />
        </div>
      </div>
    </div>
  );
};

export default SignIn;

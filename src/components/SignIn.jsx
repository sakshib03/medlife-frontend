import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./css_files/SignIn.css";
import sidelogo from "../assets/signup.png";
import medlife from "../assets/v987-18a-removebg-preview.png";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // use login from AuthContext

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/medlifeV21/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.email, data.access_token); // store token & email in cookies
        toast.success("Login successful!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          draggable: true,
          progress: undefined,
          onClose: () => {
            navigate("/disclaimer");
          },
        });
      } else {
        toast.error(data.detail || "Invalid email or password.", {
          position: "top-right",
          autoClose: 2000,
        });
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  return (
    <div className="background-content">
      <ToastContainer />
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
          <p style={{ color: "#6b6a6a", marginBottom:"20px" }}>
            Sign In to Medlife.ai to continue to Application
          </p>
          <form onSubmit={handleSubmit}>
            <label htmlFor="username" style={{ color: "gray", fontSize: "14px" , }}>
              User Name or Email
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <div style={{ position: "relative", marginBottom: "20px" }}>
              <label htmlFor="password" style={{ color: "gray", fontSize: "14px" }}>
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: "30px" }}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "38px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "gray",
                }}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            <button type="submit" className="sign-in-btn">
              Sign In
            </button>

            <p style={{ color: "gray", marginTop: "4px" }}>
              Don't have an account?{" "}
              <button
                type="button"
                style={{
                  color: "blue",
                  background: "none",
                  border: "none",
                  padding: 0,
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </button>
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

import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Menu,
} from "lucide-react";
import "./css_files/WelcomePage.css"; // Import the CSS file
import medlife from "../assets/v987-18a-removebg-preview.png";
import group1 from "../assets/Group.png";
import mainScreen from "../assets/welcome-assets/main-screen.jpeg";
import icon1 from "../assets/welcome-assets/img11.png";
import icon2 from "../assets/welcome-assets/img12.png";
import icon3 from "../assets/welcome-assets/img13.png";
import icon4 from "../assets/welcome-assets/img14.png";
import icon5 from "../assets/welcome-assets/img15.png";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

function WelcomePage() {
  const { loginWithRedirect, user, isAuthenticated } = useAuth0();
  const targetDivRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const homeRef = useRef(null);
  const featuresRef = useRef(null);
  const pricingRef = useRef(null);
  const contactRef = useRef(null);

  const scrollToHome = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToFeatures = () => {
    if (featuresRef.current) {
      featuresRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToPricing = () => {
    if (pricingRef.current) {
      pricingRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToContact = () => {
    if (contactRef.current) {
      contactRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="welcome-container">
      {/* Navbar */}
      <nav>
        <div className="navbar-logo">
          <img src={medlife} alt="Medlife Logo" />
          <p>medlife.ai</p>
        </div>
        <div className={`navbar-list ${isMenuOpen ? "open" : ""}`}>
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToHome();
              toggleMenu();
            }}
          >
            Home
          </a>
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault();
              scrollToFeatures();
              toggleMenu();
            }}
          >
            Features
          </a>
          <a
            href="#pricing"
            onClick={(e) => {
              e.preventDefault();
              scrollToPricing();
              toggleMenu();
            }}
          >
            Pricing
          </a>
          <a href="#about" onClick={toggleMenu}>
            About
          </a>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollToContact();
              toggleMenu();
            }}
          >
            Contact
          </a>
        </div>
        <button
          className="sign-in"
          onClick={() => {
            navigate("/signin");
          }}
        >
          <i className="fa fa-user"></i> Sign In
        </button>
        <button className="menu-toggle" onClick={toggleMenu}>
          <Menu size={24} />
        </button>
      </nav>

      {/* Main Content */}
      <div
        className="main-container"
        ref={homeRef}
        style={{ backgroundImage: `url(${mainScreen})` }}
      >
        <div className="side-content">
          <h1 className="main-headline">
            Your Medical <br />
            Companion, <br />
            <span className="highlight-red">Any</span>time, <br />
            <span className="highlight-red">Any</span>where...
          </h1>
          <p className="main-brief">
            Revolutionizing healthcare through cutting-edge AI, <br /> tailored
            to provide you with accurate medical insights.
          </p>
          <button
            className="choose-plan"
            onClick={(e) => {
              e.preventDefault();
              scrollToPricing();
              toggleMenu();
            }}
          >
            Choose Your Plan & <br />
            Empower Your Health Journey
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="feature-container" id="features" ref={featuresRef}>
        <h2>Features Highlights</h2>
        <div className="feature-content">
          <div className="doctor-image">
            <img src={group1} alt="Doctor Illustration" />
          </div>
          <div className="feature-list">
            {[
              {
                icon: icon5,
                title: "Instant Feedback",
                description:
                  "Don't wait for appointments. Get your queries addressed immediately.",
              },
              {
                icon: icon1,
                title: "Powered by AI Engines",
                description:
                  "We leverage one of the most sophisticated AI platforms to deliver precise and reliable responses.",
              },
              {
                icon: icon2,
                title: "Data Security",
                description:
                  "Your health information is safe with us. We prioritize data privacy and ensure its encrypted storage and transfer.",
              },
              {
                icon: icon3,
                title: "Download & Share",
                description:
                  "A unique feature allowing you to save your chat interactions. It's like having a medical journal at your fingertips.",
              },
              {
                icon: icon4,
                title: "User-Friendly Interface",
                description:
                  "No tech expertise required! A straightforward and efficient user experience for all age groups.",
              },
              {
                icon: icon1,
                title: "Powered by AI Engines",
                description:
                  "We leverage one of the most sophisticated AI platforms to deliver precise and reliable responses.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`feature-box ${index % 2 === 0 ? "even" : "odd"}`}
              >
                <img src={feature.icon} alt={feature.title} />
                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="sales-container" id="pricing" ref={pricingRef}>
        <h1>Plans and Pricing</h1>
        <p>Simple, transparent pricing that scales with your usage</p>
        <div className="pricing-cards">
          {[
            {
              title: "Essential",
              price: "$0",
              features: [
                "5K free credits",
                "5K free credits",
                "5K free credits",
                "Pay as you go $0.004/credit",
              ],
            },
            {
              title: "Growth",
              price: "$100",
              features: [
                "5K free credits",
                "Pay as you go $0.004/credit",
                "Dedicated support",
                "Custom models",
              ],
            },
            {
              title: "Enterprise",
              price: "Contact us",
              features: [
                "5K free credits",
                "5K free credits",
                "5K free credits",
              ],
            },
          ].map((plan, index) => (
            <div key={index} className="pricing-card">
              <h4>{plan.title}</h4>
              <h2>{plan.price}</h2>
              <button>
                {plan.title === "Enterprise" ? "Contact Us" : "Get Started"}
              </button>
              <ul>
                {plan.features.map((feature, i) => (
                  <li key={i}>✔ {feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        className="footer-contact"
        style={{ padding: "20px", color: "white" }}
        ref={contactRef}
      >
        <div
          className="footer-wrapper"
          style={{
            display: "flex",
            flexWrap: "wrap",
            padding: "20px",
            justifyContent: "space-between",
          }}
        >
          {/* Left Column */}
          <div
            className="footer-column"
            style={{
              flex: "1 1 250px",
              margin: "10px",
              borderRight: "1px solid white",
              paddingRight: "20px",
            }}
          >
            <div
              style={{
                borderBottom: "1px solid white",
                paddingBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <img
                src={medlife}
                alt="Advanced Insights Icon"
                style={{ width: "40px", color: "white" }}
              />
              <span>medlife.ai</span>
            </div>
            <div style={{ marginTop: "20px", color: "white" }}>
              <div className="contact-info">
                <MapPin
                  size={16}
                  style={{ marginRight: "8px", color: "white" }}
                />{" "}
                <span>1777 West Street, Canada, OR 97205</span>
              </div>
              <div className="contact-info">
                <Phone
                  size={16}
                  style={{ marginRight: "8px", color: "white" }}
                />{" "}
                <span>(+1) 123 456 7893</span>
              </div>
              <div className="contact-info">
                <Mail
                  size={16}
                  style={{ marginRight: "8px", color: "white" }}
                />{" "}
                <span>vikram@vikramsethi.com</span>
              </div>
            </div>
          </div>

          {/* Middle Column */}
          <div
            className="footer-column"
            style={{
              flex: "1 1 250px",
              margin: "10px",
              borderRight: "1px solid white",
              paddingRight: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "40px",
                borderBottom: "1px solid white",
                paddingBottom: "20px",
                marginTop: "20px",
              }}
            >
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  lineHeight: "28px",
                  color: "white",
                }}
              >
                <li>Pre-sale FAQS</li>
                <li>About US</li>
                <li>Support</li>
                <li>Contact</li>
              </ul>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  lineHeight: "28px",
                  color: "white",
                }}
              >
                <li>Service</li>
                <li>Submit a Ticket</li>
                <li>Resources</li>
                <li>Affiliates</li>
              </ul>
            </div>
            <div
              style={{ marginTop: "20px", color: "white", fontSize: "13px" }}
            >
              <p>©Vikram Sethi Contact: vikram@vikramsethi.com</p>
            </div>
          </div>

          {/* Right Column */}
          <div
            className="footer-column"
            style={{ flex: "1 1 250px", margin: "10px", paddingLeft: "20px" }}
          >
            <div>
              <p
                style={{
                  fontSize: "20px",
                  marginBottom: "20px",
                  color: "white",
                }}
              >
                Would you like to talk about your <br /> Health?
              </p>
              <button
                style={{
                  backgroundColor: "rgb(251, 38, 38)",
                  padding: "8px 16px",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Try Our AI Bot →
              </button>
            </div>
            <div style={{ marginTop: "40px", display: "flex", gap: "10px" }}>
              <a href="https://www.facebook.com/yourprofile">
                <Facebook size={22} color="white" />
              </a>
              <a href="https://twitter.com/yourprofile">
                <Twitter size={22} color="white" />
              </a>
              <a href="https://www.linkedin.com/in/yourprofile">
                <Linkedin size={22} color="white" />
              </a>
              <a href="https://www.linkedin.com/in/yourprofile">
                <Youtube size={22} color="white" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;

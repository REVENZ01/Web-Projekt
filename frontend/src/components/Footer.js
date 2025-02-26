import React from "react";
import "../CSS/Footer.css";

/**
 
Footer Component
Stellt den Footer der Webseite dar, inklusive Copyright-Informationen
und Links zu sozialen Medien.*
@returns {JSX.Element} Das gerenderte Footer-Element.*/
const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p>
          &copy; {new Date().getFullYear()} Prismarine Solutions. Alle Rechte
          vorbehalten.
        </p>
        <div className="social-media">
          <hr className="border" />
          <ul className="social-links">
            <li>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/2959748_instagram_photo_share_icon.png"
                  alt="Instagram"
                />
              </a>
            </li>
            <li>
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/2959742_broadcast_google_streaming_video_youtube_icon.png"
                  alt="YouTube"
                />
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/5340259_in_linkedin_media_portfolio_social_icon.png"
                  alt="LinkedIn"
                />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;




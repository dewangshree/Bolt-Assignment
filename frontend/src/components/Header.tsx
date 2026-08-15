import React from 'react';

interface Props {
  to?: string;
  onClick?: () => void;
}

export const Header: React.FC<Props> = ({ onClick }) => {
  return (
    <header className="header">
      <div className="header__inner">
        <a className="header__logo" href="#" onClick={onClick}>
          <span className="header__logo-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="19"
              height="19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Base bolt */}
              <path
                d="M13.4 2.2 4.6 13.3c-.24.3-.02.74.37.74h5.1l-1.02 7.6c-.07.5.57.78.87.37l8.9-11.9c.24-.32.01-.78-.39-.78h-5.1l1.4-6.53c.11-.5-.53-.83-.85-.42z"
                fill="white"
              />
              {/* Highlight sliver for depth */}
              <path
                d="M13.4 2.2 8.9 9.9h2.2l3.6-6.36c.13-.24-.05-.53-.3-.53h-.4z"
                fill="white"
                fillOpacity="0.55"
              />
            </svg>
          </span>
          <span className="header__logo-text">
            <span>
              Bolt<span className="header__logo-accent">Pay</span>
            </span>
            <span className="header__logo-tagline">Fast, secure checkout</span>
          </span>
        </a>
        <div className="header__actions">
          <span className="header__trust">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 2 4 5v6c0 5 3.4 9.2 8 11 4.6-1.8 8-6 8-11V5l-8-3z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path d="M9 12.2l2.1 2.1L15.5 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Encrypted</span>
          </span>
          <span className="badge badge--primary">Beta</span>
        </div>
      </div>
    </header>
  );
};
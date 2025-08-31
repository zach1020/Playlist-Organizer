import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-cyber-darker/80 border-t border-cyber-accent/30 backdrop-blur-md mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <p className="text-cyber-gray-lighter text-sm cyber-text">
            <span className="text-cyber-accent">Vibe-coded</span> with{' '}
            <span className="text-cyber-pink animate-pulse">♥</span> by{' '}
            <span className="text-cyber-blue font-semibold">Capybara Watanabe (Zach)</span>
          </p>
          <div className="mt-2">
            <a
              href="https://www.zachbohl.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-cyber-accent-light hover:text-cyber-accent transition-colors duration-300 cyber-text text-xs hover:scale-105 transform"
            >
              <span className="underline decoration-cyber-accent/50 underline-offset-2">
                zachbohl.com
              </span>
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

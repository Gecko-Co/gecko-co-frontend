import React from 'react';

const FacebookMessenger = ({ messengerID }) => {
  const openMessenger = () => {
    window.open(`https://m.me/${messengerID}`, '_blank', 'width=400,height=600');
  };

  return (
    <>
      <style jsx>{`
        .messenger {
          padding: 0;
          margin: 0;
          position: fixed;
          bottom: 2rem;
          right: 3rem;
          cursor: pointer;
          background-color: white;
          border-radius: 25%;
          box-shadow: 0px 1rem 1rem rgba(79, 78, 78, 0.5);
          width: 4rem;
          height: 4rem;
          display: flex;
          justify-content: center;
          align-items: center;
          opacity: 0;
          animation: slideInFromBottom 1s ease-out forwards;
          animation-delay: 2s;
        }
        
        #messenger {
          width: 3rem;
          height: 3rem;
        }

        @keyframes slideInFromBottom {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
      <div className="messenger" onClick={openMessenger}>
        <svg id="messenger" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 80 80">
          <path fillRule="evenodd" clipRule="evenodd" d="M40 .914C17.995.914.937 17.033.937 38.804c0 11.389 4.668 21.23 12.268 28.026a3.12 3.12 0 011.05 2.227l.212 6.95c.068 2.215 2.358 3.658 4.386 2.763l7.753-3.423a3.115 3.115 0 012.087-.153A42.602 42.602 0 0040 76.695c22.005 0 39.063-16.118 39.063-37.89C79.063 17.033 62.005.915 40 .915z" fill="url(#paint0_radial)"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M16.543 49.886L28.018 31.68a5.86 5.86 0 018.472-1.563l9.127 6.844c.837.628 1.989.625 2.823-.008L60.765 27.6c1.645-1.248 3.793.72 2.692 2.467L51.982 48.272a5.86 5.86 0 01-8.472 1.563l-9.127-6.845A2.344 2.344 0 0031.56 43l-12.325 9.354c-1.646 1.248-3.793-.72-2.692-2.467z" fill="#fff"/>
          <defs>
            <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="rotate(-57.092 80.25 24.628) scale(85.1246)">
              <stop stopColor="#09F"/>
              <stop offset=".61" stopColor="#A033FF"/>
              <stop offset=".935" stopColor="#FF5280"/>
              <stop offset="1" stopColor="#FF7061"/>
            </radialGradient>
          </defs>
        </svg>
      </div>
    </>
  );
};

export default FacebookMessenger;
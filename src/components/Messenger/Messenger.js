import React, { useEffect } from 'react';

const Messenger = () => {
  useEffect(() => {
    // Load the external script
    const script = document.createElement('script');
    script.src = 'https://static.elfsight.com/platform/platform.js';
    script.defer = true;
    script.setAttribute('data-use-service-core', '');
    document.body.appendChild(script);

    // Cleanup script on component unmount
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="elfsight-app-189e32c9-44b7-4ec1-9d1d-0a85f9dca870" data-elfsight-app-lazy></div>
  );
};

export default Messenger;

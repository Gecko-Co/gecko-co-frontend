import React, { useEffect } from 'react';

const Messenger = () => {
  useEffect(() => {
    // Create and append the Tawk.to script dynamically
    const script = document.createElement('script');
    script.src = 'https://embed.tawk.to/66c9b60f50c10f7a009ff2de/1i61uubjo';
    script.async = true;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    document.body.appendChild(script);

    // Clean up the script when the component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>

    </>
  );
};

export default Messenger;

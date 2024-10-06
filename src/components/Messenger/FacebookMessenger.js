import React, { useEffect } from 'react';

const FacebookMessenger = ({ pageId }) => {
  useEffect(() => {
    // Load the Facebook SDK
    window.fbAsyncInit = function() {
      window.FB.init({
        xfbml: true,
        version: 'v16.0'
      });
    };

    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = 'https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js';
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    // Cleanup function
    return () => {
      // Remove the Facebook SDK script if component unmounts
      const facebookScript = document.getElementById('facebook-jssdk');
      if (facebookScript) {
        facebookScript.remove();
      }
    };
  }, []);

  return (
    <>
      <div id="fb-root"></div>
      <div 
        className="fb-customerchat" 
        attribution="setup_tool" 
        page_id={pageId}
        theme_color="#0084ff"
        logged_in_greeting="Hi! How can we help you?"
        logged_out_greeting="Hi! How can we help you?"
      ></div>
    </>
  );
};

export default FacebookMessenger;
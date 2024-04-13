import React, { useEffect } from 'react';

const AdSenseScript = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7295113326655440";
        script.async = true;
        script.crossOrigin = "anonymous";
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return null;
};

export default AdSenseScript;
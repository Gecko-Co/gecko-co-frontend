import React from 'react';
import { FacebookProvider, CustomChat } from 'react-facebook';

const FacebookMessenger = ({ pageId, appId }) => {
  return (
    <FacebookProvider appId={appId}>
      <CustomChat pageId={pageId} minimized={true} />
    </FacebookProvider>
  );
};

export default FacebookMessenger;
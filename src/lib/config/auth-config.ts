import { validateServiceConfig } from './config-validator'

const validateAuthConfig = () => {
  const config = {
    authorizedAttorneys: process.env.AUTHORIZED_ATTORNEYS,
    googleWorkspaceDomain: process.env.GOOGLE_WORKSPACE_DOMAIN,
  };

  return validateServiceConfig('Attorney authorization', config);
};

const getAuthConfig = () => {
  const { authorizedAttorneys, googleWorkspaceDomain } = validateAuthConfig();
  
  return {
    authorizedAttorneys: authorizedAttorneys.split(',').map(email => email.trim()),
    googleWorkspaceDomain,
  };
};

export const isAuthorizedAttorney = (email: string): boolean => {
  const { authorizedAttorneys, googleWorkspaceDomain } = getAuthConfig();
  
  // Check domain restriction
  if (!email.endsWith(`@${googleWorkspaceDomain}`)) {
    return false;
  }
  
  // Check authorized attorney list
  return authorizedAttorneys.includes(email);
};
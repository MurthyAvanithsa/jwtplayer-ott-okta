import { useRef, useEffect } from 'react';
import { Redirect } from 'react-router';

import OktaSignIn from '@okta/okta-signin-widget';
import { afterOktaLogin } from '#src/stores/AccountController';

import { useOktaAuth } from '@okta/okta-react';

export const OktaSignInWidget = ({ config, onSuccess, onError }) => {
  const widgetRef = useRef();
  useEffect(() => {
    if (!widgetRef.current) return false;

    const widget = new OktaSignIn(config);

    widget
      .showSignInToGetTokens({
        el: widgetRef.current,
      })
      .then(onSuccess)
      .catch(onError);

    widget.after('identify', async () => {
      // custom logic can go here. when the function resolves, execution will continue.
      console.debug('After sigin rendered');
    });

    return () => widget.remove();
  }, [config, onSuccess, onError]);

  return <div ref={widgetRef} />;
};

export const Login = ({ config }) => {
  const { oktaAuth, authState } = useOktaAuth();

  const onSuccess = async (tokens) => {
    console.debug('Auth signin widget on success', tokens);
    oktaAuth.handleLoginRedirect(tokens);
    await afterOktaLogin(true, tokens);
  };

  const onError = (err) => {
    console.debug('error logging in', err);
  };

  if (!authState) return null;
  // return <OktaSignInWidget config={config} onSuccess={onSuccess} onError={onError} />;
  return authState.isAuthenticated ? <Redirect to={{ pathname: '/' }} /> : <OktaSignInWidget config={config} onSuccess={onSuccess} onError={onError} />;
};

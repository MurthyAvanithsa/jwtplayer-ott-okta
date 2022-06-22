import React, { useEffect, useRef, useState } from 'react';
import { Redirect, useHistory } from 'react-router';
import shallow from 'zustand/shallow';

import Dialog from '../../components/Dialog/Dialog';
import useQueryParam from '../../hooks/useQueryParam';
import { addQueryParam, removeQueryParam } from '../../utils/history';
import PaymentFailed from '../../components/PaymentFailed/PaymentFailed';
import Welcome from '../../components/Welcome/Welcome';
import { useAccountStore } from '../../stores/AccountStore';
import LoadingOverlay from '../../components/LoadingOverlay/LoadingOverlay';
import { useConfigStore } from '../../stores/ConfigStore';

import styles from './AccountModal.module.scss';
// import Login from './forms/Login';
import Registration from './forms/Registration';
import PersonalDetails from './forms/PersonalDetails';
import ChooseOffer from './forms/ChooseOffer';
import Checkout from './forms/Checkout';
import ResetPassword from './forms/ResetPassword';
import CancelSubscription from './forms/CancelSubscription';
import RenewSubscription from './forms/RenewSubscription';

import EditPassword from './forms/EditPassword';

import OktaSignIn from '@okta/okta-signin-widget';
import { useOktaAuth } from '@okta/okta-react';

const PUBLIC_VIEWS = ['login', 'create-account', 'forgot-password', 'reset-password', 'send-confirmation', 'edit-password'];

const oktaSignInConfig = {
  baseUrl: 'https://venuokta.oktapreview.com',
  clientId: '0oa19fxless7exPvV0h8',
  redirectUri: window.location.origin + '/login/callback',
  // authParams: {
  //   // If your app is configured to use the Implicit flow
  //   // instead of the Authorization Code with Proof of Code Key Exchange (PKCE)
  //   // you will need to uncomment the below line
  //   // pkce: false
  // },
  flow: 'signup',

  features: {
    registration: true, // Enable self-service registration flow
    rememberMe: true, // Setting to false will remove the checkbox to save username
    //multiOptionalFactorEnroll: true,            // Allow users to enroll in multiple optional factors before finishing the authentication flow.
    //selfServiceUnlock: true,                    // Will enable unlock in addition to forgotten password
    //smsRecovery: true,                          // Enable SMS-based account recovery
    //callRecovery: true,                         // Enable voice call-based account recovery
    router: true, // Leave this set to true for this demo
  },
};

const OktaSignInWidget = ({ config, onSuccess, onError }) => {
  const widgetRef = useRef();
  useEffect(() => {
    if (!widgetRef.current) return false;

    const widget = new OktaSignIn(config);

    widget
      .showSignIn({
        el: widgetRef.current,
      })
      .then(onSuccess)
      .catch(onError);

    return () => widget.remove();
  }, [config, onSuccess, onError]);

  return <div ref={widgetRef} />;
};

const OktaSignUpWidget = ({ config, onSuccess, onError }) => {
  const widgetRef = useRef();
  useEffect(() => {
    if (!widgetRef.current) return false;

    const widget = new OktaSignIn(config);

    widget
      .showSignIn({
        el: widgetRef.current,
      })
      .then(onSuccess)
      .catch(onError);

    widget.on('afterRender', function (data) {
      // This is the code that makes it look as if the Okta Sign-In Widget has been loaded to the "Registration" view
      const view = data.controller;
      if (view == 'primary-auth') {
        document.getElementsByClassName('registration-link')[0].click();
      }
    });

    return () => widget.remove();
  }, [config, onSuccess, onError]);

  return <div ref={widgetRef} />;
};

const Login = ({ config }) => {
  const { oktaAuth, authState } = useOktaAuth();

  const onSuccess = (tokens) => {
    console.debug('Auth signin widget on success', tokens);
    oktaAuth.handleLoginRedirect(tokens);
  };

  const onError = (err) => {
    console.debug('error logging in', err);
  };

  if (!authState) return null;
  // return <OktaSignInWidget config={config} onSuccess={onSuccess} onError={onError} />;
  return authState.isAuthenticated ? <Redirect to={{ pathname: '/' }} /> : <OktaSignInWidget config={config} onSuccess={onSuccess} onError={onError} />;
};

const SignUp = ({ config }) => {
  const { oktaAuth, authState } = useOktaAuth();

  const onSuccess = (tokens) => {
    console.debug('Auth signin widget on success', tokens);
    oktaAuth.handleLoginRedirect(tokens);
  };

  const onError = (err) => {
    console.debug('error logging in', err);
  };

  if (!authState) return null;
  // return <OktaSignInWidget config={config} onSuccess={onSuccess} onError={onError} />;
  return authState.isAuthenticated ? <Redirect to={{ pathname: '/' }} /> : <OktaSignUpWidget config={config} onSuccess={onSuccess} onError={onError} />;
};

const AccountModal = () => {
  const history = useHistory();
  const viewParam = useQueryParam('u');
  const [view, setView] = useState(viewParam);
  const message = useQueryParam('message');
  const { loading, auth } = useAccountStore(({ loading, auth }) => ({ loading, auth }), shallow);
  const config = useConfigStore((s) => s.config);
  const {
    assets: { banner },
    siteName,
  } = config;
  const isPublicView = viewParam && PUBLIC_VIEWS.includes(viewParam);

  useEffect(() => {
    // make sure the last view is rendered even when the modal gets closed
    if (viewParam) setView(viewParam);
  }, [viewParam]);

  useEffect(() => {
    if (!!viewParam && !loading && !auth && !isPublicView) {
      history.push(addQueryParam(history, 'u', 'login'));
    }
  }, [viewParam, history, loading, auth, isPublicView]);

  const closeHandler = () => {
    history.push(removeQueryParam(history, 'u'));
  };

  const renderForm = () => {
    if (!auth && loading && !isPublicView) {
      return (
        <div style={{ height: 300 }}>
          <LoadingOverlay inline />
        </div>
      );
    }

    switch (view) {
      case 'login':
        return <Login config={oktaSignInConfig} />;
      case 'create-account':
        // return <Registration />;
        return <SignUp config={oktaSignInConfig} />;

      case 'personal-details':
        return <PersonalDetails />;
      case 'choose-offer':
        return <ChooseOffer />;
      case 'checkout':
        return <Checkout />;
      case 'paypal-error':
        return <PaymentFailed type="error" message={message} onCloseButtonClick={closeHandler} />;
      case 'paypal-cancelled':
        return <PaymentFailed type="cancelled" onCloseButtonClick={closeHandler} />;
      case 'welcome':
        return <Welcome onCloseButtonClick={closeHandler} onCountdownCompleted={closeHandler} siteName={siteName} />;
      case 'reset-password':
        return <ResetPassword type="reset" />;
      case 'forgot-password':
        return <ResetPassword type="forgot" />;
      case 'send-confirmation':
        return <ResetPassword type="confirmation" />;
      case 'edit-password':
        return <EditPassword />;
      case 'unsubscribe':
        return <CancelSubscription />;
      case 'renew-subscription':
        return <RenewSubscription />;
    }
  };

  return (
    <Dialog open={!!viewParam} onClose={closeHandler}>
      <div className={styles.banner}>{banner ? <img src={banner} alt="" /> : null}</div>
      {renderForm()}
    </Dialog>
  );
};

export default AccountModal;

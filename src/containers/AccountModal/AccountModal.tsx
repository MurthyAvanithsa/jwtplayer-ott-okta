import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
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
import PersonalDetails from './forms/PersonalDetails';
import ChooseOffer from './forms/ChooseOffer';
import Checkout from './forms/Checkout';
import ResetPassword from './forms/ResetPassword';
import CancelSubscription from './forms/CancelSubscription';
import RenewSubscription from './forms/RenewSubscription';
import EditPassword from './forms/EditPassword';
import { Login } from './forms/OktaLogin';

const PUBLIC_VIEWS = ['login', 'create-account', 'forgot-password', 'reset-password', 'send-confirmation', 'edit-password'];

const oktaSignInConfig = {
  issuer: 'https://dev-60961954.okta.com/oauth2/default',
  clientId: '0oa5luc7pzUMCi5sG5d7',
  redirectUri: window.location.origin + '/login/callback',
  useInteractionCodeFlow: true,
  // features: {
  //   registration: true, // Enable self-service registration flow
  //   rememberMe: true, // Setting to false will remove the checkbox to save username
  //   //multiOptionalFactorEnroll: true,            // Allow users to enroll in multiple optional factors before finishing the authentication flow.
  //   //selfServiceUnlock: true,                    // Will enable unlock in addition to forgotten password
  //   //smsRecovery: true,                          // Enable SMS-based account recovery
  //   //callRecovery: true,                         // Enable voice call-based account recovery
  //   router: true, // Leave this set to true for this demo
  // },
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
        return <Login config={{ ...oktaSignInConfig, flow: 'login' }} />;
      case 'create-account':
        return <Login config={{ ...oktaSignInConfig, flow: 'signup' }} />;

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

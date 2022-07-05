import React, { FC, useEffect, useRef } from 'react';
import { Redirect, Route, Switch, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import User from '../../screens/User/User';
import Series from '../../screens/Series/Series';
import Layout from '../../containers/Layout/Layout';
import Home from '../../screens/Home/Home';
import Playlist from '../../screens/Playlist/Playlist';
import Movie from '../../screens/Movie/Movie';
import Search from '../../screens/Search/Search';
import ErrorPage from '../ErrorPage/ErrorPage';
import AccountModal from '../../containers/AccountModal/AccountModal';
import About from '../../screens/About/About';

import { Security } from '@okta/okta-react';
import '@okta/okta-signin-widget/dist/css/okta-sign-in.min.css';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';

const oktaAuthConfig = {
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
type Props = {
  error?: Error | null;
};

const Root: FC<Props> = ({ error }: Props) => {
  const { t } = useTranslation('error');
  const history = useHistory();
  const oktaAuth = new OktaAuth(oktaAuthConfig);

  if (error) {
    return (
      <ErrorPage title={t('generic_error_heading', 'There was an issue loading the application')}>
        <p>{t('generic_error_description', 'Try refreshing this page or come back later.')}</p>
      </ErrorPage>
    );
  }

  const customAuthHandler = () => {
    history.push('/login');
  };

  const restoreOriginalUri = async (_oktaAuth, originalUri) => {
    history.replace(toRelativeUrl(originalUri, window.location.origin));
  };

  return (
    <Security oktaAuth={oktaAuth} onAuthRequired={customAuthHandler} restoreOriginalUri={restoreOriginalUri}>
      <Layout>
        <Switch>
          <Route path="/" component={Home} exact />
          <Route path="/p/:id" component={Playlist} exact />
          <Route path="/m/:id/:slug?" component={Movie} exact />
          <Route path="/s/:id/:slug?" component={Series} />
          <Route path="/q/:query?" component={Search} />
          <Route path="/u/:page?" component={User} />
          <Route path="/o/about" component={About} />
          {/* <Route path="/login" render={() => <Login config={oktaSignInConfig} />} /> */}
          <Route>
            <ErrorPage title={t('notfound_error_heading', 'Not found')}>
              <p>{t('notfound_error_description', "This page doesn't exist.")}</p>
            </ErrorPage>
          </Route>
        </Switch>
        <AccountModal />
      </Layout>
    </Security>
  );
};

export default Root;

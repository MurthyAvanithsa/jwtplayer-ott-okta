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
  // Note: If your app is configured to use the Implicit flow
  // instead of the Authorization Code with Proof of Code Key Exchange (PKCE)
  // you will need to add `pkce: false`
  issuer: 'https://dev-00964696.okta.com/oauth2/default',
  clientId: '0oa5bx8lok59myqWo5d7',
  redirectUri: window.location.origin + '/login/callback',
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

import React, { FC, ReactNode, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import shallow from 'zustand/shallow';

import { useAccountStore } from '../../stores/AccountStore';
import useSearchQueryUpdater from '../../hooks/useSearchQueryUpdater';
import { useUIStore } from '../../stores/UIStore';
import Button from '../../components/Button/Button';
import MarkdownComponent from '../../components/MarkdownComponent/MarkdownComponent';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import DynamicBlur from '../../components/DynamicBlur/DynamicBlur';
import MenuButton from '../../components/MenuButton/MenuButton';
import { addQueryParam } from '../../utils/history';
import UserMenu from '../../components/UserMenu/UserMenu';
import { useConfigStore } from '../../stores/ConfigStore';

import styles from './Layout.module.scss';

type LayoutProps = {
  children?: ReactNode;
};

const Layout: FC<LayoutProps> = ({ children }) => {
  const history = useHistory();
  const { t } = useTranslation('common');
  const { config, accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const { menu, assets, siteName, description, integrations, styling, features } = config;
  const cleengId = integrations?.cleeng?.id;
  const { searchPlaylist } = features || {};
  const { footerText, dynamicBlur } = styling || {};

  const { blurImage, searchQuery, searchActive, userMenuOpen } = useUIStore(
    ({ blurImage, searchQuery, searchActive, userMenuOpen }) => ({
      blurImage,
      searchQuery,
      searchActive,
      userMenuOpen,
    }),
    shallow,
  );
  const { updateSearchQuery, resetSearchQuery } = useSearchQueryUpdater();
  const isLoggedIn = !!useAccountStore((state) => state.user);

  const searchInputRef = useRef<HTMLInputElement>(null) as React.MutableRefObject<HTMLInputElement>;

  const [sideBarOpen, setSideBarOpen] = useState(false);
  const hasDynamicBlur = dynamicBlur === true;
  const banner = assets.banner;

  useEffect(() => {
    if (searchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchActive]);

  const searchButtonClickHandler = () => {
    useUIStore.setState({
      searchActive: true,
      preSearchPage: history.location,
    });
  };

  const closeSearchButtonClickHandler = () => {
    resetSearchQuery();

    useUIStore.setState({
      searchActive: false,
    });
  };

  const loginButtonClickHandler = () => {
    history.push(addQueryParam(history, 'u', 'login'));
  };

  const signUpButtonClickHandler = () => {
    history.push(addQueryParam(history, 'u', 'create-account'));
  };

  const toggleUserMenu = (value: boolean) =>
    useUIStore.setState({
      userMenuOpen: value,
    });

  const renderUserActions = () => {
    if (!cleengId) return null;

    return isLoggedIn ? (
      <UserMenu showPaymentsItem={accessModel !== 'AVOD'} />
    ) : (
      <div className={styles.buttonContainer}>
        <Button fullWidth onClick={loginButtonClickHandler} label={t('sign_in')} />
        <Button variant="contained" color="primary" onClick={signUpButtonClickHandler} label={t('sign_up')} fullWidth />
      </div>
    );
  };

  return (
    <div className={styles.layout}>
      <Helmet>
        <title>{siteName}</title>
        <meta name="description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:title" content={siteName} />
        <meta name="twitter:title" content={siteName} />
        <meta name="twitter:description" content={description} />
      </Helmet>
      <div className={styles.main}>
        {hasDynamicBlur && blurImage && <DynamicBlur url={blurImage} transitionTime={1} debounceTime={350} />}
        <Header
          onMenuButtonClick={() => setSideBarOpen(true)}
          logoSrc={banner}
          searchEnabled={!!searchPlaylist}
          searchBarProps={{
            query: searchQuery,
            onQueryChange: (event) => updateSearchQuery(event.target.value),
            onClearButtonClick: () => updateSearchQuery(''),
            inputRef: searchInputRef,
          }}
          searchActive={searchActive}
          onSearchButtonClick={searchButtonClickHandler}
          onCloseSearchButtonClick={closeSearchButtonClickHandler}
          onLoginButtonClick={loginButtonClickHandler}
          onSignUpButtonClick={signUpButtonClickHandler}
          isLoggedIn={isLoggedIn}
          userMenuOpen={userMenuOpen}
          toggleUserMenu={toggleUserMenu}
          canLogin={!!cleengId}
          showPaymentsMenuItem={accessModel !== 'AVOD'}
        >
          <Button label={t('home')} to="/" variant="text" />
          {menu.map((item) => (
            <Button key={item.contentId} label={item.label} to={`/p/${item.contentId}`} variant="text" />
          ))}
        </Header>
        <Sidebar isOpen={sideBarOpen} onClose={() => setSideBarOpen(false)}>
          <MenuButton label={t('home')} to="/" tabIndex={sideBarOpen ? 0 : -1} />
          {menu.map((item) => (
            <MenuButton key={item.contentId} label={item.label} to={`/p/${item.contentId}`} tabIndex={sideBarOpen ? 0 : -1} />
          ))}
          <hr className={styles.divider} />
          {renderUserActions()}
        </Sidebar>
        {children}
      </div>
      {!!footerText && (
        <div className={styles.footer}>
          <MarkdownComponent markdownString={footerText} />
        </div>
      )}
    </div>
  );
};

export default Layout;

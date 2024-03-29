import React from 'react';
import { render } from '@testing-library/react';

import Button from '../Button/Button';

import Header from './Header';

describe('<Header />', () => {
  test('renders header', () => {
    const playlistMenuItems = [<Button key="key" label="Home" to="/" />];
    const { container } = render(
      <Header
        onMenuButtonClick={vi.fn()}
        searchBarProps={{
          query: '',
          onQueryChange: vi.fn(),
        }}
        searchEnabled
        searchActive={false}
        onSearchButtonClick={vi.fn()}
        onCloseSearchButtonClick={vi.fn()}
        onLoginButtonClick={vi.fn()}
        userMenuOpen={false}
        toggleUserMenu={vi.fn()}
        isLoggedIn={false}
        canLogin={true}
        showPaymentsMenuItem={true}
      >
        {playlistMenuItems}
      </Header>,
    );

    expect(container).toMatchSnapshot();
  });
});

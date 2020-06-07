import React from 'react';
import { render, screen, act, waitForElementToBeRemoved, fireEvent } from '@testing-library/react';
import { Route, MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '../redux/store';
import Theme from '../stylesheets/theme/theme';

import getPosts from '../helper/redditAPI';
import Search, { convertToHeatMapData } from './search';
import searchJson from '../helper/search.json';
import mockPosts_reactjslearn from '../helper/__mocks__/mockPosts_reactjslearn.json';
import mockPosts_javascript from '../helper/__mocks__/mockPosts_javascript.json';

jest.mock('../helper/redditAPI');
afterEach(() => jest.clearAllMocks());

const { defaultSubreddit } = searchJson;

const setup = (mockState = 'pass', data = mockPosts_javascript) => {
  const component = <Search />;
  const path = 'search';
  const url = `/${path}/${defaultSubreddit}`;
  if (mockState === 'pass') {
    getPosts.mockResolvedValueOnce(data);
  } else if (mockState === 'fail') {
    getPosts.mockRejectedValue(data);
  };

  return (
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[url]}>
          <Theme>
            <Route path={`/${path}/:redditName`}>
              {component}
            </Route>
          </Theme>
        </MemoryRouter>
      </Provider>
    )
  )
}

describe('Search Page', () => {
  test('loading default subreddit with success', async () => {
    setup();

    expect(screen.getByTestId('searchForm')).toBeInTheDocument();
    const input = screen.getByTestId('searchInput');
    expect(input.value).toEqual(defaultSubreddit);

    await waitForElementToBeRemoved(screen.getByTestId('loadSpinner'));
    expect(screen.getByTestId('heatMap')).toBeInTheDocument();
    await act(() => Promise.resolve());
  });

  test('change subreddit being search', async () => {
    const NEW_SUBREDDIT = 'news';
    setup();
    const button = screen.getByRole('button');
    const input = screen.getByTestId('searchInput');
    expect(input.value).toEqual(defaultSubreddit);
    await waitForElementToBeRemoved(screen.getByTestId('loadSpinner'));
    fireEvent.change(input, { target: { value: NEW_SUBREDDIT } });
    expect(input.value).toEqual(NEW_SUBREDDIT);
    fireEvent.click(button);
    await waitForElementToBeRemoved(screen.getByTestId('loadSpinner'));
    expect(screen.getByTestId('heatMap')).toBeInTheDocument();
    await act(() => Promise.resolve());
  });

})

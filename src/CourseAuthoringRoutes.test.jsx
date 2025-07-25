import CourseAuthoringRoutes from './CourseAuthoringRoutes';
import { getApiWaffleFlagsUrl } from './data/api';
import {
  screen, initializeMocks, render, waitFor,
} from './testUtils';

const courseId = 'course-v1:edX+TestX+Test_Course';
const pagesAndResourcesMockText = 'Pages And Resources';
const videoSelectorContainerMockText = 'Video Selector Container';
const customPagesMockText = 'Custom Pages';
const mockComponentFn = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    courseId,
  }),
}));

// Mock the TinyMceWidget
jest.mock('./editors/sharedComponents/TinyMceWidget', () => ({
  __esModule: true, // Required to mock a default export
  default: () => <div>Widget</div>,
  Footer: () => <div>Footer</div>,
  prepareEditorRef: jest.fn(() => ({
    refReady: true,
    setEditorRef: jest.fn().mockName('prepareEditorRef.setEditorRef'),
  })),
}));

jest.mock('./pages-and-resources/PagesAndResources', () => (props) => {
  mockComponentFn(props);
  return pagesAndResourcesMockText;
});
jest.mock('./selectors/VideoSelectorContainer', () => (props) => {
  mockComponentFn(props);
  return videoSelectorContainerMockText;
});
jest.mock('./custom-pages/CustomPages', () => (props) => {
  mockComponentFn(props);
  return customPagesMockText;
});

describe('<CourseAuthoringRoutes>', () => {
  beforeEach(async () => {
    const { axiosMock } = initializeMocks();
    axiosMock
      .onGet(getApiWaffleFlagsUrl(courseId))
      .reply(200, {});
  });

  it('renders the PagesAndResources component when the pages and resources route is active', async () => {
    render(
      <CourseAuthoringRoutes />,
      { routerProps: { initialEntries: ['/pages-and-resources'] } },
    );
    await waitFor(() => {
      expect(screen.getByText(pagesAndResourcesMockText)).toBeVisible();
      expect(mockComponentFn).toHaveBeenCalledWith(
        expect.objectContaining({
          courseId,
        }),
      );
    });
  });

  it('renders the VideoSelectorContainer component when the course videos route is active', async () => {
    render(
      <CourseAuthoringRoutes />,
      { routerProps: { initialEntries: ['/editor/course-videos/block-id'] } },
    );
    await waitFor(() => {
      expect(screen.queryByText(videoSelectorContainerMockText)).toBeInTheDocument();
      expect(screen.queryByText(pagesAndResourcesMockText)).not.toBeInTheDocument();
      expect(mockComponentFn).toHaveBeenCalledWith(
        expect.objectContaining({
          courseId,
        }),
      );
    });
  });
});

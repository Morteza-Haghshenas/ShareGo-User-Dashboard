import { IWebPartContext } from '@microsoft/sp-webpart-base';
import { DisplayMode } from '@microsoft/sp-core-library';
import IPromotedLinkDataProviderFactory from '../../common/IPromotedLinkDataProviderFactory';
import IPromotedLinkDataSource from '../../models/IPromotedLinkDataSource';
import ListOperationCallback from '../../models/ListOperationCallback';

interface IUserDashboardContainerProps {
  dataProviderFactory: IPromotedLinkDataProviderFactory;
  selectedDataSources: IPromotedLinkDataSource[];
  webPartContext: IWebPartContext;
  webPartDisplayMode: DisplayMode;
  onListCreated: ListOperationCallback;
  configureStartCallback: () => void;
}

export default IUserDashboardContainerProps;
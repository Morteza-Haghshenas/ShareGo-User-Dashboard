import { IWebPartContext } from '@microsoft/sp-webpart-base';
import { DisplayMode } from '@microsoft/sp-core-library';
import IPromotedLinkDataProviderFactory from '../../common/IPromotedLinkDataProviderFactory';
import IPromotedLinkDataSource from '../../models/IPromotedLinkDataSource';

interface IPromotedLinkListProps {
  dataProviderFactory: IPromotedLinkDataProviderFactory;
  dataSource: IPromotedLinkDataSource;
  webPartContext: IWebPartContext;
  webPartDisplayMode: DisplayMode;
}

export default IPromotedLinkListProps;
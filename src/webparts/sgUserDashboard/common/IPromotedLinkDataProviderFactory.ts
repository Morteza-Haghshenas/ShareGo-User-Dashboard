import IPromotedLinkDataSource from '../models/IPromotedLinkDataSource';
import { IWebPartContext } from '@microsoft/sp-webpart-base';
import IPromotedLinkDataProvider from '../dataProviders/IPromotedLinkDataProvider';

interface IPromotedLinkDataProviderFactory {
  webPartContext: IWebPartContext;
  createDataProvider(dataSource: IPromotedLinkDataSource): IPromotedLinkDataProvider;
}

export default IPromotedLinkDataProviderFactory;
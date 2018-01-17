import { IWebPartContext } from '@microsoft/sp-webpart-base';
import IPromotedLinkDataSource from '../models/IPromotedLinkDataSource';

interface IPromotedLinkDataSourceProvider {

  webPartContext: IWebPartContext;

  getAvailableDataSources(): Promise<IPromotedLinkDataSource[]>;

  getPersonalDataSource(): Promise<IPromotedLinkDataSource>;
}

export default IPromotedLinkDataSourceProvider;
import { IWebPartContext } from '@microsoft/sp-webpart-base';
import IPromotedLinkItem from '../models/IPromotedLinkItem';
import IPromotedLinkDataSource from '../models/IPromotedLinkDataSource';

interface IPromotedLinkDataProvider {

  webPartContext: IWebPartContext;

  dataSource: IPromotedLinkDataSource;

  getItems(): Promise<IPromotedLinkItem[]>;

  addItem(itemAdded: IPromotedLinkItem): Promise<IPromotedLinkItem[]>;

  updateItem(itemUpdated: IPromotedLinkItem): Promise<IPromotedLinkItem[]>;

  deleteItem(itemDeleted: IPromotedLinkItem): Promise<IPromotedLinkItem[]>;
}

export default IPromotedLinkDataProvider;
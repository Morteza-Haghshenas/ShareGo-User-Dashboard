import { IWebPartContext } from '@microsoft/sp-webpart-base';
import pnp, { Web, List, ListEnsureResult, ListAddResult } from "sp-pnp-js";
import IPromotedLinkDataSource from '../models/IPromotedLinkDataSource';
import IPromotedLinkDataProvider from '../dataProviders/IPromotedLinkDataProvider';
import IPromotedLinkItem from '../models/IPromotedLinkItem';

export default class PromotedLinkDataProvider implements IPromotedLinkDataProvider {
  public dataSource: IPromotedLinkDataSource;

  private _dataSource: IPromotedLinkDataSource;
  private _items: IPromotedLinkItem[];
  private _webPartContext: IWebPartContext;

  constructor(dataSource: IPromotedLinkDataSource) {
    this._dataSource = dataSource;
    this._items = [];
  }

  public set webPartContext(value: IWebPartContext) {
    this._webPartContext = value;
  }

  public get webPartContext(): IWebPartContext {
    return this._webPartContext;
  }

  public getItems(): Promise<IPromotedLinkItem[]> {
    const list = pnp.sp.web.lists.getById(this._dataSource.Id);
    return new Promise<IPromotedLinkItem[]>((resolve) => {
      list.items.orderBy('TileOrder, Title')
                .select('Id', 'Title', 'Description', 'TileOrder', 'LinkLocation', 'BackgroundImageLocation')
                .get()
                .then((items: any[]) => {
        this._items = [];
        items.forEach(item => {
          var promotedLink = this._convertFromSPItem(item);
          if (promotedLink !== null) {
            this._items.push(promotedLink);
          }
        });
        resolve(this._items);
      });
    });
  }

  public addItem(itemAdded: IPromotedLinkItem): Promise<IPromotedLinkItem[]> {
    return pnp.sp.web.lists.getById(this._dataSource.Id).items.add(
      {
        Title: itemAdded.Title,
        Description: itemAdded.Description,
        TileOrder: itemAdded.Order,
        LinkLocation: { Description: '', Url: itemAdded.Url },
        BackgroundImageLocation: { Description: itemAdded.ImageUrl, Url: itemAdded.ImageUrl }
      }).then((result) => {
        const addedItem = this._convertFromSPItem(result.data);
        this._items.push(addedItem);
        return Promise.resolve(this._items);
      }).catch((error) => {
        return Promise.reject(new Error(error));
      });
  }

  public updateItem(itemUpdated: IPromotedLinkItem): Promise<IPromotedLinkItem[]> {
    const itemIndex = this._items.map((item) => item.Id).indexOf(itemUpdated.Id);

    if (itemIndex > -1) {
      const list = pnp.sp.web.lists.getById(this._dataSource.Id);
      return list.items.getById(itemUpdated.Id).update(
        {
          Title: itemUpdated.Title,
          Description: itemUpdated.Description,
          TileOrder: itemUpdated.Order,
          LinkLocation: { Description: '', Url: itemUpdated.Url },
          BackgroundImageLocation: { Description: itemUpdated.ImageUrl, Url: itemUpdated.ImageUrl }
        }).then(() => {
          this._items[itemIndex] = itemUpdated;
          return Promise.resolve(this._items);
      }).catch((error) => {
        return Promise.reject(new Error(error));
      });
    } else {
      return Promise.reject(new Error(`Item to update doesn't exist.`));
    }
  }

  public deleteItem(itemDeleted: IPromotedLinkItem): Promise<IPromotedLinkItem[]> {
    const items: IPromotedLinkItem[] = this._items.filter((item: IPromotedLinkItem) => item.Id == itemDeleted.Id);

    if (items.length > 0) {
      const list = pnp.sp.web.lists.getById(this._dataSource.Id);
      return new Promise<IPromotedLinkItem[]>((resolve) => {
        list.items.getById(itemDeleted.Id).delete().then(() => {
          this._items = this._items.filter((item: IPromotedLinkItem) => item.Id != itemDeleted.Id);
          resolve(this._items);
        }).catch((error) => {
          return Promise.reject(new Error(error));
        });
    });
    } else {
      return Promise.reject(new Error(`Item to delete doesn't exist.`));
    }
  }

  private _convertFromSPItem(spItem: any) : IPromotedLinkItem {
    var promotedLink: IPromotedLinkItem = {
      Id: spItem.Id,
      Title: spItem.Title,
      Description: spItem.Description,
      Order: spItem.TileOrder,
      Url: null,
      ImageUrl: null
    };

    if (spItem.LinkLocation !== null) {
      promotedLink.Url = spItem.LinkLocation.Url;
    }

    if (spItem.BackgroundImageLocation !== null) {
      promotedLink.ImageUrl = spItem.BackgroundImageLocation.Url;
    }

    return promotedLink;
  }
}
import { IWebPartContext } from '@microsoft/sp-webpart-base';
import IPromotedLinkDataSource from '../models/IPromotedLinkDataSource';
import IPromotedLinkDataProvider from '../dataProviders/IPromotedLinkDataProvider';
import IPromotedLinkItem from '../models/IPromotedLinkItem';

export default class MockedPromotedLinkDataProvider implements IPromotedLinkDataProvider {
  public dataSource: IPromotedLinkDataSource;

  private _idCounter: number;
  private _items: IPromotedLinkItem[];
  private _webPartContext: IWebPartContext;

  constructor() {
    this._idCounter = 0;

    this._items = [
        this._createMockPromotedLinkItem('Sunt filet mignon ut ut porchetta', '', ''),
        this._createMockPromotedLinkItem('Laborum flank brisket esse chuck t-bone', '', ''),
        this._createMockPromotedLinkItem('consectetur ex meatloaf boudin beef laborum pastrami', '', '')
      ];
    }

  public set webPartContext(value: IWebPartContext) {
    this._webPartContext = value;
  }

  public get webPartContext(): IWebPartContext {
    return this._webPartContext;
  }

  public getItems(): Promise<IPromotedLinkItem[]> {
    const items: IPromotedLinkItem[] = this._items;

    return new Promise<IPromotedLinkItem[]>((resolve) => {
      setTimeout(() => resolve(items), 1000);
    });
  }

  public addItem(itemAdded: IPromotedLinkItem): Promise<IPromotedLinkItem[]> {
    itemAdded.Id = this._idCounter++;
    this._items = this._items.concat(itemAdded);
    return this.getItems();
  }

  public updateItem(itemUpdated: IPromotedLinkItem): Promise<IPromotedLinkItem[]> {
    const items: IPromotedLinkItem[] = this._items.filter((item: IPromotedLinkItem) => item.Id == itemUpdated.Id);

    if (items.length > 0) {
      this._items[0] = itemUpdated;
      return this.getItems();
    }
    else {
      return Promise.reject(new Error(`Item to update doesn't exist.`));
    }
  }

  public deleteItem(itemDeleted: IPromotedLinkItem): Promise<IPromotedLinkItem[]> {
    this._items = this._items.filter((item: IPromotedLinkItem) => item.Id !== itemDeleted.Id);

    return this.getItems();
  }

  private _createMockPromotedLinkItem(title: string, description: string, imageUrl: string): IPromotedLinkItem {
    const mockItem: IPromotedLinkItem = {
      Id: this._idCounter++,
      Order: this._idCounter++,
      Title: title,
      Description: description ,
      ImageUrl: imageUrl,
      Url : imageUrl
    };
    return mockItem;
  }
}
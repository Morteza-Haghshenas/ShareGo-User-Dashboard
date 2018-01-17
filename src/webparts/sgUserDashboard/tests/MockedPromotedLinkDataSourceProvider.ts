import { IWebPartContext } from '@microsoft/sp-webpart-base';
import IPromotedLinkDataSourceProvider from '../dataSourceProviders/IPromotedLinkDataSourceProvider';
import IPromotedLinkDataSource from '../models/IPromotedLinkDataSource';

export default class PromotedLinkDataSourceProvider implements IPromotedLinkDataSourceProvider {

  public webPartContext: IWebPartContext;

  public getAvailableDataSources(): Promise<IPromotedLinkDataSource[]> {
    return new Promise<IPromotedLinkDataSource[]>(
      (resolve) => {
        resolve([{
                  Order: 999,
                  Title: "Personal",
                  Id: "mocked",
                  Url: "mocked",
                  EffectiveBasePermissions: null
                },
                { Order: 999,
                  Title: "Personal",
                  Id: "mocked",
                  Url: "mocked",
                  EffectiveBasePermissions: null
                }
                ]);
      });
  }

  public getPersonalDataSource(): Promise<IPromotedLinkDataSource> {
    return new Promise<IPromotedLinkDataSource>(
      (resolve) => {
        resolve({
                  Order: 999,
                  Title: "Personal",
                  Id: "mocked",
                  Url: "mocked",
                  EffectiveBasePermissions: null
                });
      });
  }
}
import { IWebPartContext } from '@microsoft/sp-webpart-base';
import {
  SPHttpClient,
  SPHttpClientResponse   
} from '@microsoft/sp-http';
import PromotedLinkListManager from '../common/PromotedLinkListManager';
import IPromotedLinkDataSourceProvider from '../dataSourceProviders/IPromotedLinkDataSourceProvider';
import IPromotedLinkDataSource from '../models/IPromotedLinkDataSource';

export default class PromotedLinkDataSourceProvider implements IPromotedLinkDataSourceProvider {

  public webPartContext: IWebPartContext;

  constructor(webPartContext: IWebPartContext) {
    this.webPartContext = webPartContext;
  }
  
  public getAvailableDataSources(): Promise<IPromotedLinkDataSource[]> {
    throw new Error('Method not implemented.');
  }

  public getPersonalDataSource(): Promise<IPromotedLinkDataSource> {
    return new Promise<IPromotedLinkDataSource>(
      (resolve) => {
          const promise = this.webPartContext.spHttpClient.get(
                this.webPartContext.pageContext.web.absoluteUrl + `/_api/SP.UserProfiles.PeopleManager/GetMyProperties/PersonalUrl`,
                SPHttpClient.configurations.v1);
          promise.then(
              (response: SPHttpClientResponse) => {
                if(!response.ok) {
                  throw new Error("Could not query personal URL.");
                }
                let mySiteUrl: string;
                response.json().then((result) => {
                  mySiteUrl = result.value;

                  let listManager = new PromotedLinkListManager();
                  listManager.ensurePromotedLinkList(mySiteUrl, "My Favourite Links").then(list => {
                    resolve({
                      Order: 999,
                      Title: "My Favourite Links",
                      Id: mySiteUrl,
                      Url: mySiteUrl,
                      EffectiveBasePermissions: null
                    });
                  });
                });
          });
      });
  }
}
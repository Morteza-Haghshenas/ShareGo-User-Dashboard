import IPromotedLinkDataSource from '../models/IPromotedLinkDataSource';
import IPromotedLinkDataProviderFactory from '../common/IPromotedLinkDataProviderFactory';
import IPromotedLinkDataProvider from '../dataProviders/IPromotedLinkDataProvider';
import MockedPromotedLinkDataProvider from '../tests/MockedPromotedLinkDataProvider';
import PromotedLinkDataProvider from '../dataProviders/PromotedLinkDataProvider';

import { IWebPartContext } from '@microsoft/sp-webpart-base';
import { Environment, EnvironmentType } from '@microsoft/sp-core-library';

export default class PromotedLinkDataProviderFactory implements IPromotedLinkDataProviderFactory {

  private _webPartContext: IWebPartContext;

  public set webPartContext(value: IWebPartContext) {
    this._webPartContext = value;
  }

  public get webPartContext(): IWebPartContext {
    return this._webPartContext;
  }

  public createDataProvider(dataSource: IPromotedLinkDataSource): IPromotedLinkDataProvider {
    /*
    Create the appropriate data provider depending on where the web part is running.
    The DEBUG flag will ensure the mock data provider is not bundled with the web part when you package the solution for distribution, that is, using the --ship flag with the package-solution gulp command.
    */
    if (DEBUG && Environment.type === EnvironmentType.Local) {
      return new MockedPromotedLinkDataProvider();
    } else {
      const provider = new PromotedLinkDataProvider(dataSource);
      provider.webPartContext = this._webPartContext;
      return provider;
    }
  }
}
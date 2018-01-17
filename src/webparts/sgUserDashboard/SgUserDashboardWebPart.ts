import * as React from 'react';
import * as ReactDom from 'react-dom';
import pnp, { List, PermissionKind, BasePermissions } from "sp-pnp-js";
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  IPropertyPaneField,
  PropertyPaneLabel,
  PropertyPaneCheckbox,
  IPropertyPaneCheckboxProps,
  PropertyPaneButton,
  PropertyPaneButtonType,
  PropertyPaneHorizontalRule
} from '@microsoft/sp-webpart-base';
import { Environment, EnvironmentType } from '@microsoft/sp-core-library';
import * as _ from "lodash";

import * as strings from 'JustLinksStrings';
import { ISgUserDashboardWebPartProps } from './ISgUserDashboardWebPartProps';

import IPromotedLinkList from './models/IPromotedLinkList';

import IPromotedLinkDataSourceProvider from './dataSourceProviders/IPromotedLinkDataSourceProvider';
import PromotedLinkDataSourceProvider from './dataSourceProviders/PromotedLinkDataSourceProvider';
import MockedPromotedLinkDataSourceProvider from './tests/MockedPromotedLinkDataSourceProvider';
import IPromotedLinkDataSource from './models/IPromotedLinkDataSource';

import IPromotedLinkDataProviderFactory from './common/IPromotedLinkDataProviderFactory';
import PromotedLinkDataProviderFactory from './common/PromotedLinkDataProviderFactory';

import PromotedLinkListManager from './common/PromotedLinkListManager';

import IUserDashboardContainerProps from './components/UserDashboardContainer/IUserDashboardContainerProps';
import UserDashboardContainer from './components/UserDashboardContainer/UserDashboardContainer';

export default class SgUserDashboardWebPart extends BaseClientSideWebPart<ISgUserDashboardWebPartProps> {
  private _userDashboardContainerComponent: UserDashboardContainer;

  private _dataSourceProvider: IPromotedLinkDataSourceProvider;
  private _dataProviderFactory: IPromotedLinkDataProviderFactory;

  private _promotedLinkListManager: PromotedLinkListManager;
  private _disableListCheckboxes: boolean;

  private _listCheckboxes: IPropertyPaneField<IPropertyPaneCheckboxProps>[];
  private _listCheckboxProps: any[];

  private _availableLinkLists: IPromotedLinkList[] = [];
  private _selectedDataSources: IPromotedLinkDataSource[] = [];

  private _userPermissions: BasePermissions;

  protected onInit(): Promise<void> {
    this.context.statusRenderer.displayLoadingIndicator(this.domElement, strings.ProductName);
    this._openPropertyPane = this._openPropertyPane.bind(this);    
    this._onAddNewList = this._onAddNewList.bind(this);
    this._onAddNewListFinished = this._onAddNewListFinished.bind(this);

    if (DEBUG && Environment.type === EnvironmentType.Local) {
      this._dataSourceProvider = new MockedPromotedLinkDataSourceProvider();
    } else {
      this._dataSourceProvider = new PromotedLinkDataSourceProvider(this.context);
    }

    this._dataProviderFactory = new PromotedLinkDataProviderFactory();

    if (this.properties.selectedListIds === undefined) {
      this.properties.selectedListIds = [];
    }

    this._promotedLinkListManager = new PromotedLinkListManager();

    pnp.setup({
      spfxContext: this.context
    });    

    var onInit = super.onInit;
    const promises: Promise<any>[] = [];

    promises.push(this._loadPromotedLinkLists().then(() => {
      var i = 0;
      this.properties.selectedListIds.forEach(id => {        
        var lists = this._availableLinkLists.filter(list => list.Id === id);
        if (lists.length >= 1) {
          this._selectedDataSources.push(
          { 
            Id: lists[0].Id,
            Url: lists[0].Url,
            Title: lists[0].Title,
            Description: lists[0].Description,
            EffectiveBasePermissions: lists[0].EffectiveBasePermissions,
            Order: i++
          });
        }
      });
    }));
    
    promises.push(pnp.sp.web.getCurrentUserEffectivePermissions().then(permissions => {
        this._userPermissions = permissions;
      })
    );

    return Promise.all(promises).then(() => {
      this.context.statusRenderer.clearLoadingIndicator(this.domElement);
      onInit();
    });
  }

  public render(): void {
    /*
    Create the react element we want to render in the web part DOM. Pass the required props to the react component. 
    */
    const element: React.ReactElement<IUserDashboardContainerProps> = React.createElement(
      UserDashboardContainer,
      {
        dataProviderFactory: this._dataProviderFactory,
        selectedDataSources: _.clone(this._selectedDataSources),
        webPartContext: this.context,
        webPartDisplayMode: this.displayMode,
        onListCreated: this._onAddNewListFinished,
        configureStartCallback: this._openPropertyPane
      }
    );

    this._userDashboardContainerComponent = <UserDashboardContainer>ReactDom.render(element, this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }
  
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.SettingsGroupName,
              groupFields: this._getGroupFields()
            }
          ]
        }
      ]
    };
  }

  private _getGroupFields(): IPropertyPaneField<any>[] {
    const fields: IPropertyPaneField<any>[] = [];
    /*
    When we do not have any lists returned from the server, we disable the dropdown. If that is the case,
    we also add a label field displaying the appropriate message. 
    */
    if (this._disableListCheckboxes) {
      fields.push(PropertyPaneLabel(null, {
        text: strings.NoPromotedLinkListFound
      }));
    } else {
      fields.push(PropertyPaneLabel(null, {
        text: strings.ChoosePromotedLinkLists
      }));
      
      this._listCheckboxes = [];
      let listCheckboxProps = this._availableLinkLists.map((list: IPromotedLinkList) => {
        return {
          text: list.Title,
          promotedLinkList: list
        };
      });

      listCheckboxProps.forEach(element => {
        const checkbox = PropertyPaneCheckbox(`listCheckbox_${element.promotedLinkList.Id}`, element);
        fields.push(checkbox);
        this._listCheckboxes.push(checkbox);
      });
    }

    if (pnp.sp.web.hasPermissions(this._userPermissions, PermissionKind.ManageLists)) {
      fields.push(PropertyPaneHorizontalRule());
      fields.push(PropertyPaneButton('addListButton', {
        text: strings.AddNewList,
        buttonType: PropertyPaneButtonType.Normal,
        icon: 'Add',
        onClick: this._onAddNewList
      }));
    }

    return fields;
  }

  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {
    const checkboxes = this._listCheckboxes.filter((item) => item.targetProperty == propertyPath);
    if (checkboxes.length > 0) {
      const checkbox:any = checkboxes[0];
      if (newValue === true) {
        this._selectedDataSources.push(
        { 
          Id: checkbox.properties.promotedLinkList.Id,
          Url: checkbox.properties.promotedLinkList.Url,
          Title: checkbox.properties.text,
          Description: checkbox.properties.promotedLinkList.Description,
          EffectiveBasePermissions: checkbox.properties.promotedLinkList.EffectiveBasePermissions,
          Order: 0
        });
        this.properties.selectedListIds.push(checkbox.properties.promotedLinkList.Id);
      } else {
        this._selectedDataSources = this._selectedDataSources.filter(
          (item) => item.Id !== checkbox.properties.promotedLinkList.Id);
        this.properties.selectedListIds = this.properties.selectedListIds.filter(
          (id) => id !== checkbox.properties.promotedLinkList.Id);
      }
    } else {
      // do nothing
      return;
    }    

    /*
    Finally, tell property pane to re-render the web part. 
    This is valid for reactive property pane. 
    */
    super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
  }

  private _openPropertyPane(): void {
    this.context.propertyPane.open();
  }

  private _loadPromotedLinkLists(): Promise<any> {
    return this._promotedLinkListManager.getAllPromotedLinkLists()
      .then((linkLists: IPromotedLinkList[]) => {
        // Disable list checkboxes if there are no results from the server.
        this._disableListCheckboxes = linkLists.length === 0;
        if (linkLists.length !== 0) {
          this._availableLinkLists = linkLists;
        }
      });
  }

  private _onAddNewList(value: any) : any {
    this._userDashboardContainerComponent.createPromotedLinkList();
    return '';
  }

  private _onAddNewListFinished(list: IPromotedLinkList) {
    if (list != null) {
      this._availableLinkLists.push(list);
      this.context.propertyPane.refresh();
    }
  }
}
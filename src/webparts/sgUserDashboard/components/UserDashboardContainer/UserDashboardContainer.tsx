import * as React from 'react';
import { DisplayMode } from '@microsoft/sp-core-library';
import { Placeholder } from '@microsoft/sp-application-base';
import { Fabric } from 'office-ui-fabric-react';
import { Compare } from '@microsoft/sp-client-base';
import update = require('react-addons-update');
import * as strings from 'JustLinksStrings';

import styles from './UserDashboardContainer.module.scss';
import PromotedLinkList from '../PromotedLinkList/PromotedLinkList';
import IUserDashboardContainerProps from './IUserDashboardContainerProps';

import PromotedLinkListForm from '../PromotedLinkListForm/PromotedLinkListForm';
import IPromotedLinkList from '../../models/IPromotedLinkList';

export default class UserDashboard extends React.Component<IUserDashboardContainerProps, {}> {
  private _showPlaceHolder: boolean = false;
  private _promotedLinkListForm: PromotedLinkListForm;

  constructor(props: IUserDashboardContainerProps) {
    super(props); 

    this._configureWebPart = this._configureWebPart.bind(this);
    this._createPromotedLinkListComplete = this._createPromotedLinkListComplete.bind(this);
    this._updatePromotedLinkListComplete = this._updatePromotedLinkListComplete.bind(this);
  }

  public componentWillReceiveProps(props: IUserDashboardContainerProps) {
  }

  public componentDidMount() {
  }  
  
  public shouldComponentUpdate(nextProps: IUserDashboardContainerProps, nextState: {}): boolean {
    return !Compare.shallowCompare(this.props, nextProps) || !Compare.shallowCompare(this.state, nextState);
  }

  public render(): JSX.Element {
    console.log("Data sources: " + this.props.selectedDataSources.length);
    this.props.selectedDataSources.forEach(element => {
      console.log(element.Id);
    });
    this._setShowPlaceHolder();

    return (
      <Fabric>
        <div className={ styles.userDashboard }>
          { this.props.selectedDataSources.map((object, i) => {
              return <PromotedLinkList
              key= { object.Id }
              dataProviderFactory={ this.props.dataProviderFactory }
              dataSource={ object }
              webPartContext={ this.props.webPartContext }
              webPartDisplayMode={ this.props.webPartDisplayMode } />;
          })}
          { this._showPlaceHolder === true &&                         
              /*<Placeholder
                  icon={ 'ms-Icon--ThumbnailView' }
                  iconText={ strings.ProductName }
                  description={ strings.GetStarted }
                  buttonLabel={ strings.Configure }
                  onAdd={ this._configureWebPart } />*/              
              <p>Placeholder</p>
          }
        </div>
        <PromotedLinkListForm
          webPartContext={ this.props.webPartContext }
          onListUpdated= { this._updatePromotedLinkListComplete }
          onListCreated= { this._createPromotedLinkListComplete }
          ref= { (ref) => this._promotedLinkListForm = ref } />
      </Fabric>
    );
  }

  private _configureWebPart(): void {
    this.props.configureStartCallback();
  }

  private _setShowPlaceHolder(): void {
    if (this.props.selectedDataSources.length === 0 && this.props.webPartDisplayMode === DisplayMode.Edit) {
      this._showPlaceHolder = true;
    } else {
      this._showPlaceHolder = false;
    }
  }

  public createPromotedLinkList(): void {
    this._promotedLinkListForm.setState({
      showDialog: true,
      currentList: this._promotedLinkListForm.emptyList()
     });
  }

  private _createPromotedLinkListComplete(promotedLinkList: IPromotedLinkList) {
    this.props.onListCreated(promotedLinkList);
  }

  private _updatePromotedLinkListComplete(promotedLinkList: IPromotedLinkList) {
    // this.componentWillReceiveProps(this.props);
  }
}
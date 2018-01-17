import * as React from 'react';
import * as _ from "lodash";
import { Compare } from '@microsoft/sp-client-base';
import {
  List,
  FocusZone,
  FocusZoneDirection,
  getRTLSafeKeyCode,
  KeyCodes,
  Link,
  Label,
  Button,
  ButtonType,
  css } from 'office-ui-fabric-react';
import { IRectangle } from "office-ui-fabric-react/lib/common/IRectangle";
import { DisplayMode } from '@microsoft/sp-core-library';
import * as strings from 'JustLinksStrings';
import IPromotedLinkDataProvider from '../../dataProviders/IPromotedLinkDataProvider';
import IPromotedLinkListProps from './IPromotedLinkListProps';
import IPromotedLinkListState from './IPromotedLinkListState';
import PromotedLinkListItem from '../PromotedLinkListItem/PromotedLinkListItem';
import PromotedLinkItemForm from '../PromotedLinkItemForm/PromotedLinkItemForm';
import IPromotedLinkItem from '../../models/IPromotedLinkItem';
import PermissionManager from "../../common/PermissionManager";
import { PermissionKind } from "sp-pnp-js/lib/types";
import update = require('react-addons-update');
import styles from './PromotedLinkList.module.scss';
import itemStyles from '../PromotedLinkListItem/PromotedLinkListItem.module.scss';

export default class PromotedLinkList extends React.Component<IPromotedLinkListProps, IPromotedLinkListState> {
  private _dataProvider: IPromotedLinkDataProvider;
  private _promotedLinkItemForm: PromotedLinkItemForm;

  constructor(props: IPromotedLinkListProps) {
    super(props);

    this._dataProvider = this.props.dataProviderFactory.createDataProvider(
          this.props.dataSource);

    this.state = {
      promotedLinkItems: []
    };

    this._getItemCountForPage = this._getItemCountForPage.bind(this);
    this._onRenderCell = this._onRenderCell.bind(this);
    this._deletePromotedLinkItem = this._deletePromotedLinkItem.bind(this);
    this._editPromotedLinkItem = this._editPromotedLinkItem.bind(this);
    this._editPromotedLinkItemComplete = this._editPromotedLinkItemComplete.bind(this);
    this._handleAddItemClick = this._handleAddItemClick.bind(this);
    this._addPromotedLinkItemComplete = this._addPromotedLinkItemComplete.bind(this);
  }

  public componentWillReceiveProps(props: IPromotedLinkListProps) {
    this._dataProvider.getItems().then(
      (items: IPromotedLinkItem[]) => {
          const newItems = update(this.state.promotedLinkItems, { $set: items });
          this._includeAddTile(newItems);
          this.setState({ promotedLinkItems: newItems });
      });
  }

  public componentDidMount() {
    this._dataProvider.getItems().then(
      (items: IPromotedLinkItem[]) => {
          this._includeAddTile(items);
          this.setState({ promotedLinkItems: items });
      });
  }

  public shouldComponentUpdate(nextProps: IPromotedLinkListProps, nextState: IPromotedLinkListState): boolean {
    return !Compare.shallowCompare(this.props, nextProps) || !Compare.shallowCompare(this.state, nextState);
  }

  public render(): JSX.Element {
    if (this.state.promotedLinkItems.length == 0) {
      return (null);
    }

    return (
      <div className={ styles.promotedLinkListContainer }>
        <div className={ styles.promotedLinkListHeader }>
          { this.props.webPartDisplayMode === DisplayMode.Edit &&
            <div className={ styles.topRowEditLink }>
              <Link
                target='_blank'
                href={ this.props.dataSource.Url + '/AllItems.aspx' }
                disabled={ this.props.dataSource.Url === undefined || this.props.dataSource.Url === null }
                title={ strings.EditPromotedLinkList }>
                { strings.Edit }
              </Link>
            </div>
          }
          <h2 className={ styles.promotedLinkListTitle }>{ this.props.dataSource.Title }</h2>
          { this.props.dataSource.Description !== '' &&
            <p className={ styles.promotedLinkListDescription } >{ this.props.dataSource.Description }</p>
          }
        </div>
        <FocusZone
          direction={ FocusZoneDirection.bidirectional }
          isInnerZoneKeystroke={ (ev: React.KeyboardEvent<HTMLElement>) => ev.which === getRTLSafeKeyCode(KeyCodes.space) }>
          <List
            getItemCountForPage={ this._getItemCountForPage }
            className={ styles.promotedLinkList }
            items={ this.state.promotedLinkItems }
            onRenderCell={ this._onRenderCell } />
        </FocusZone>
        <PromotedLinkItemForm
          dataProvider= { this._dataProvider }
          onItemEdited= { this._editPromotedLinkItemComplete }
          onItemAdded= { this._addPromotedLinkItemComplete }
          ref= {(ref) => this._promotedLinkItemForm = ref} />
      </div>
    );
  }

  private _getItemCountForPage(itemIndex?: number, visibleRect?: IRectangle) : number {
    return 100;
  }

  private _onRenderCell(item: IPromotedLinkItem, index: number) {
    if (item.ImageUrl == 'SG-ADD-TILE') {
      return this._renderAddTile();
    }

    return (
      <PromotedLinkListItem
        key= { item.Id }
        dataSource= { this.props.dataSource }
        item= { item }
        onDeleteListItem={ this._deletePromotedLinkItem }
        onEditListItem={ this._editPromotedLinkItem }
        webPartDisplayMode={ this.props.webPartDisplayMode } />
    );
  }

  private _renderAddTile() {
    const itemTileRoot: string = css(
        itemStyles.itemTileRoot,
        'ms-u-slideDownIn20'
      );
    return (
      <div
        role='listitem'
        className={ itemTileRoot }
        data-is-focusable={ true }
        >
        <FocusZone direction={ FocusZoneDirection.horizontal }>
          <div className={ css(itemStyles.itemTileContent) }>
            <Button
              title={ strings.AddNewTile }
              className={ css(itemStyles.addButton) }
              buttonType={ ButtonType.icon }
              icon='Add'
              onClick={ this._handleAddItemClick }
            />
          </div>
        </FocusZone>
      </div>
      );
  }

  private _deletePromotedLinkItem(promotedLinkItem: IPromotedLinkItem): Promise<any> {
    return this._dataProvider.deleteItem(promotedLinkItem).then(
      (items: IPromotedLinkItem[]) => {
        const newItems = update(this.state.promotedLinkItems, { $set: items });
        this.setState({ promotedLinkItems: newItems });
      });
  }

  private _editPromotedLinkItem(promotedLinkItem: IPromotedLinkItem): Promise<any> {
    var itemCopy = _.clone(promotedLinkItem);
    this._promotedLinkItemForm.setState({ showDialog: true, currentItem: itemCopy });
    return Promise.resolve(null);
  }

  private _editPromotedLinkItemComplete(promotedLinkItem: IPromotedLinkItem) {
    this.componentWillReceiveProps(this.props);
  }

   private _handleAddItemClick(event: React.MouseEvent<HTMLButtonElement>) {
     this._promotedLinkItemForm.setState({
       showDialog: true,
       currentItem: this._promotedLinkItemForm.emptyItem()
    });
  }

  private _addPromotedLinkItemComplete(promotedLinkItem: IPromotedLinkItem) {
    // TODO: Should use states
    this.componentWillReceiveProps(this.props);
  }

  private _includeAddTile(items: IPromotedLinkItem[]) {
    const canAddItem = PermissionManager.hasPermission(this.props.dataSource, PermissionKind.AddListItems);
    if (canAddItem && this.props.webPartDisplayMode == DisplayMode.Edit) {
      items.push(
      {
        Description: '',
        Id: 0,
        ImageUrl: 'SG-ADD-TILE',
        Order: 0,
        Title: '',
        Url: ''
      });
    }
  }
}

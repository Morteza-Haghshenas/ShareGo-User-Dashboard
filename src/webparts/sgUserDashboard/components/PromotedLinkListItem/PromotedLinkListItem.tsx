import * as React from 'react';
import { Compare } from '@microsoft/sp-client-base';
import {
  Checkbox,
  Button,
  ButtonType,
  FocusZone,
  FocusZoneDirection,
  css
} from 'office-ui-fabric-react';
import { DisplayMode } from '@microsoft/sp-core-library';
import styles from './PromotedLinkListItem.module.scss';
import IPromotedLinkItem from '../../models/IPromotedLinkItem';
import IPromotedLinkListItemProps from './IPromotedLinkListItemProps';
import IPromotedLinkListItemState from './IPromotedLinkListItemState';
import update = require('react-addons-update');
import PermissionManager from "../../common/PermissionManager";
import { PermissionKind } from "sp-pnp-js/lib/types";
import * as strings from 'JustLinksStrings';

export default class PromotedLinkListItem extends React.Component<IPromotedLinkListItemProps, IPromotedLinkListItemState> {
  private static ANIMATION_TIMEOUT: number = 400;
  private _animationTimeoutId: number;

  constructor(props: IPromotedLinkListItemProps) {
    super(props);

    this._handleDeleteClick = this._handleDeleteClick.bind(this);
    this._handleEditClick = this._handleEditClick.bind(this);

    this.state = { isDeleting: false, isDeleted: false };
  }

  public shouldComponentUpdate(nextProps: IPromotedLinkListItemProps, nextState: IPromotedLinkListItemState): boolean {
    return !Compare.shallowCompare(this.props, nextProps) || !Compare.shallowCompare(this.state, nextState);
  }

  public componentWillUnmount(): void {
    window.clearTimeout(this._animationTimeoutId);
  }

  public render(): JSX.Element {
    const itemTileRoot: string = css(
      styles.itemTileRoot,
      'ms-u-slideDownIn20',
      {
        'ms-u-fadeOut400': this.state.isDeleting,
        [styles.itemDeleted]: this.state.isDeleted
      }
    );
    
    const canDeleteItem = PermissionManager.hasPermission(this.props.dataSource, PermissionKind.DeleteListItems);
    const canEditItem = PermissionManager.hasPermission(this.props.dataSource, PermissionKind.EditListItems);

    return (
      <div
        role='listitem'
        className={ itemTileRoot }
        data-is-focusable={ true }
        >
        <FocusZone direction={ FocusZoneDirection.horizontal }>
          { this.props.webPartDisplayMode === DisplayMode.Edit && canEditItem &&
            <div className={ styles.buttonContainer }>
              <Button
                title={ strings.EditTile }
                className={ css(styles.editButton) }
                buttonType={ ButtonType.icon }
                icon='Edit'
                onClick={this._handleEditClick}
              />
              <Button
                title={ strings.DeleteTile }
                className={ css(styles.deleteButton) }
                buttonType={ ButtonType.icon }
                icon='Cancel'
                onClick={this._handleDeleteClick}
              />
            </div>
          }
          <a href={this.props.item.Url} target='_blank'>
            <div className={ css(styles.itemTileContent) } style={{ backgroundImage: "url(" + this.props.item.ImageUrl + ")" }}>
              <div className={ css(styles.itemTitle, 'ms-fontColor-neutralDark') }>{this.props.item.Title}</div>
              <div className={ css(styles.itemDescription, 'ms-fontColor-neutralDark') }>{this.props.item.Description}</div>
            </div>
          </a>
        </FocusZone>
      </div>
    );
  }

  private _handleDeleteClick(event: React.MouseEvent<HTMLButtonElement>) {
    this.setState({ isDeleting: true, isDeleted: false });
    
    this._handleWithAnimation((listItem) => {
      this.props.onDeleteListItem(listItem);
      this.setState({ isDeleting: false, isDeleted: true });
    });
  }

  private _handleEditClick(event: React.MouseEvent<HTMLButtonElement>) {
    this.props.onEditListItem(this.props.item);
  }

  private _handleWithAnimation(callback: (task: IPromotedLinkItem) => void): void {
    // After ANIMATION_TIMEOUT milliseconds, the animation is finished and
    // we will handle the callback task and remove the animation from it.
    window.clearTimeout(this._animationTimeoutId);
    this._animationTimeoutId = window.setTimeout(
      () => {
        callback(this.props.item);
      },
      PromotedLinkListItem.ANIMATION_TIMEOUT
    );
  }
}
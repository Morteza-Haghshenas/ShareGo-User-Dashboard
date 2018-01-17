import { DisplayMode } from '@microsoft/sp-core-library';
import IPromotedLinkItem from '../../models/IPromotedLinkItem';
import IPromotedLinkDataSource from '../../models/IPromotedLinkDataSource';
import ItemOperationCallback from '../../models/ItemOperationCallback';

interface IPromotedLinkListItemProps {
  dataSource: IPromotedLinkDataSource;
  item: IPromotedLinkItem;
  onDeleteListItem: ItemOperationCallback;
  onEditListItem: ItemOperationCallback;
  webPartDisplayMode: DisplayMode;
}

export default IPromotedLinkListItemProps;
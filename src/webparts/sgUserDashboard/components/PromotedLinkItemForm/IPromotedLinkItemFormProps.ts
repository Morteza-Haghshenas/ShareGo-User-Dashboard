import IPromotedLinksDataProvider from '../../dataProviders/IPromotedLinkDataProvider';
import ItemOperationCallback from '../../models/ItemOperationCallback';

interface IPromotedLinkItemFormProps {
  dataProvider: IPromotedLinksDataProvider;
  onItemEdited: ItemOperationCallback;
  onItemAdded: ItemOperationCallback;
}

export default IPromotedLinkItemFormProps;
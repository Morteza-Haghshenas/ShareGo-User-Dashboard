import { IWebPartContext } from '@microsoft/sp-webpart-base';
import ListOperationCallback from '../../models/ListOperationCallback';

interface IPromotedLinkListFormProps {
  webPartContext: IWebPartContext;
  onListUpdated: ListOperationCallback;
  onListCreated: ListOperationCallback;
}

export default IPromotedLinkListFormProps;
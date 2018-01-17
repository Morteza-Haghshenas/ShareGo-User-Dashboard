import * as React from 'react';
import { css, Dialog, DialogType, DialogFooter, Button, ButtonType, TextField } from 'office-ui-fabric-react';
import styles from './PromotedLinkListForm.module.scss';
import IPromotedLinkListFormProps from './IPromotedLinkListFormProps';
import IPromotedLinkListFormState from './IPromotedLinkListFormState';
import IPromotedLinkList from '../../models/IPromotedLinkList';

import PromotedLinkListManager from '../../common/PromotedLinkListManager';

export default class PromotedLinkItemForm extends React.Component<IPromotedLinkListFormProps, IPromotedLinkListFormState> {
  private _titleTextField: TextField;
  private _descriptionTextField: TextField;

  private _saveButton: Button;
  private _isNewItem: boolean = true;

  private _listManager: PromotedLinkListManager;

  constructor(props: IPromotedLinkListFormProps) {
    super(props);
    this.state = {
      showDialog: false,
      currentList: this.emptyList()
    };

    this._listManager = new PromotedLinkListManager();

    this._titleTextFieldChanged = this._titleTextFieldChanged.bind(this);
    this._descriptionTextFieldChanged = this._descriptionTextFieldChanged.bind(this);
  }

  public componentDidMount() {
  }

  public render(): JSX.Element {
    this._isNewItem = true;

    return (
      <div style={{ zIndex: 1000}}>
        <Dialog
          isOpen={ this.state.showDialog }
          type={ DialogType.normal }
          onDismiss={ this._closeDialog.bind(this) }
          title= { this._isNewItem ? 'Create new list' : 'Update list' }
          isBlocking={ true }
        >
          <div className={ css(styles.linkListForm, 'ms-Grid') }>
            <TextField
              label='Title'
              required={ true }
              ref={ (ref) => this._titleTextField = ref }
              className={ 'ms-Grid-row' }
              value={ this.state.currentList.Title }
              onBeforeChange={ this._titleTextFieldChanged }            
              autoComplete='on' />
            <TextField
              label='Description'
              multiline
              rows={ 5 }
              resizable={ false }
              ref={ (ref) => this._descriptionTextField = ref }
              className={ 'ms-Grid-row' }
              value={ this.state.currentList.Description }
              onBeforeChange={ this._descriptionTextFieldChanged }
              autoComplete='off' />
          </div>
          <DialogFooter>
            <Button
              buttonType={ ButtonType.primary }
              onClick={ this._handleSubmit.bind(this) }
              ref={ (ref) => this._saveButton = ref }>Save</Button>
            <Button onClick={ this._cancelDialog.bind(this) }>Cancel</Button>
          </DialogFooter>
        </Dialog>
      </div>
    );
  }

  private _closeDialog() {
    this.setState({ showDialog: false, currentList: this.state.currentList });
  }

  private _cancelDialog() {
    this.setState({ showDialog: false, currentList: this.emptyList() });
  }

  private _handleSubmit() {
    if (this._isNewItem) {
      this._listManager.createPromotedLinkList(
        this.state.currentList.Title,
        this.state.currentList.Description).then((list) => {
          this.props.onListCreated(list);
          this.setState({ showDialog: false, currentList: this.emptyList() });
      }).catch(() => {
        this.props.onListCreated(null);
        this.setState({ showDialog: false, currentList: this.emptyList() });
      });
    } else {
      // this.props.dataProvider.updateItem(this.state.currentItem).then(() => {
      //   this.props.onListUpdated(this.state.currentList);
      //   this.setState({ showDialog: false, currentList: this.emptyList() });
      // });
    }
  }

  private _titleTextFieldChanged(newValue: string): void {
    this.state.currentList.Title = newValue;
    if (newValue.length < 1) {
      // this._titleTextField.props.errorMessage = 'Error!';
    } else {
      // this._titleTextField.props.errorMessage = null;
      this.setState(this.state);
    }
  }

  private _descriptionTextFieldChanged(newValue: string): void {
    this.state.currentList.Description = newValue;
    this.setState(this.state);
  }

  public emptyList(): IPromotedLinkList {
    return {
      Id: '',
      Description: '',
      EffectiveBasePermissions: null,
      Title: '',
      Url: ''
    };
  }
}
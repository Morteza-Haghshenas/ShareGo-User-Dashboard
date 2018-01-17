import * as React from 'react';
import { css, Dialog, DialogType, DialogFooter, Button, ButtonType, TextField } from 'office-ui-fabric-react';
import IPromotedLinkItemFormProps from './IPromotedLinkItemFormProps';
import IPromotedLinkItemFormState from './IPromotedLinkItemFormState';
import IPromotedLinkItem from '../../models/IPromotedLinkItem';
import styles from './PromotedLinkItemForm.module.scss';

export default class PromotedLinkItemForm extends React.Component<IPromotedLinkItemFormProps, IPromotedLinkItemFormState> {
  private _titleTextField: TextField;
  private _descriptionTextField: TextField;
  private _orderTextField: TextField;
  private _urlTextField: TextField;
  private _imageUrlTextField: TextField;

  private _saveButton: Button;
  private _isNewItem: boolean = true;

  constructor(props: IPromotedLinkItemFormProps) {
    super(props);
    this.state = {
      showDialog: false,
      currentItem: this.emptyItem()
    };

    this._titleTextFieldChanged = this._titleTextFieldChanged.bind(this);
    this._descriptionTextFieldChanged = this._descriptionTextFieldChanged.bind(this);
    this._orderTextFieldChanged = this._orderTextFieldChanged.bind(this);
    this._urlTextFieldChanged = this._urlTextFieldChanged.bind(this);
    this._imageUrlTextFieldChanged = this._imageUrlTextFieldChanged.bind(this);
  }

  public componentDidMount() {
  }

  public render(): JSX.Element {
    this._isNewItem = this.state.currentItem.Id == -1;

    return (
      <div style={{ zIndex: 1000}}>
      <Dialog
        isOpen={this.state.showDialog}
        type={DialogType.normal}
        onDismiss={this._closeDialog.bind(this)}
        title= { this._isNewItem ? 'Create new item' : 'Update item' }
        isBlocking={true}
      >
        <div className={ css(styles.linkItemForm, 'ms-Grid') }>
          <TextField
            label='Title'
            required={ true }
            ref={ (ref) => this._titleTextField = ref }
            className={ 'ms-Grid-row' }
            value={ this.state.currentItem.Title }
            onBeforeChange={ this._titleTextFieldChanged }            
            autoComplete='on' />
          <TextField
            label='Description'
            multiline
            rows={ 5 }
            resizable={ false }
            ref={ (ref) => this._descriptionTextField = ref }
            className={ 'ms-Grid-row' }
            value={ this.state.currentItem.Description }
            onBeforeChange={ this._descriptionTextFieldChanged }
            autoComplete='off' />
          <TextField
            label='Order'
            ref={ (ref) => this._orderTextField = ref }
            className={ 'ms-Grid-row' }
            value={ this.state.currentItem.Order ? this.state.currentItem.Order.toString() : '0' }
            onBeforeChange={ this._orderTextFieldChanged }
            autoComplete='off' />
          <TextField
            label='URL'
            required={ true }
            ref={ (ref) => this._urlTextField = ref }
            className={ 'ms-Grid-row' }
            value={ this.state.currentItem.Url }
            onBeforeChange={ this._urlTextFieldChanged }
            autoComplete='on' />
          <TextField
            label='Image URL'
            ref={ (ref) => this._imageUrlTextField = ref }
            className={ 'ms-Grid-row' }
            value={ this.state.currentItem.ImageUrl }
            onBeforeChange={ this._imageUrlTextFieldChanged }
            autoComplete='on' />
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
    this.setState({ showDialog: false, currentItem: this.state.currentItem });
  }

  private _cancelDialog() {
    this.setState({ showDialog: false, currentItem: this.emptyItem() });
  }

  private _handleSubmit() {
    if (this._isNewItem) {
      this.props.dataProvider.addItem(this.state.currentItem).then(() => {
        this.props.onItemEdited(this.state.currentItem);
        this.setState({ showDialog: false, currentItem: this.emptyItem() });
      });
    } else {
      this.props.dataProvider.updateItem(this.state.currentItem).then(() => {
        this.props.onItemEdited(this.state.currentItem);
        this.setState({ showDialog: false, currentItem: this.emptyItem() });
      });
    }
  }

  private _titleTextFieldChanged(newValue: string): void {
    this.state.currentItem.Title = newValue;
    if (newValue.length < 1) {
      // this._titleTextField.props.errorMessage = 'Error!';
    } else {
      // this._titleTextField.props.errorMessage = null;
      this.setState(this.state);
    }
  }

  private _descriptionTextFieldChanged(newValue: string): void {
    this.state.currentItem.Description = newValue;
    this.setState(this.state);
  }

  private _orderTextFieldChanged(newValue: string): void {
    const numberValue = Number(newValue);
    if (numberValue != NaN) {
      this.state.currentItem.Order = numberValue;
    }    
    this.setState(this.state);
  }

  private _urlTextFieldChanged(newValue: string): void {
    this.state.currentItem.Url = newValue;
    this.setState(this.state);
  }

  private _imageUrlTextFieldChanged(newValue: string): void {
    this.state.currentItem.ImageUrl = newValue;
    this.setState(this.state);
  }

  public emptyItem(): IPromotedLinkItem {
    return {
        Id: -1,
        Title: '',
        Description: '',
        Order: 0,
        ImageUrl: '',
        Url: ''
      };
  }
}
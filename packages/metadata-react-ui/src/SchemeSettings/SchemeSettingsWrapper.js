/**
 * ### Контейнер сохраненных настроек
 * Кнопка открытия + диалог
 *
 * @module SchemeSettingsWrapper
 *
 * Created 31.12.2016
 */

import React, {Component, PropTypes} from "react";
import IconButton from "material-ui/IconButton";
import IconSettings from "material-ui/svg-icons/action/settings";
import RaisedButton from "material-ui/RaisedButton";
import FlatButton from "material-ui/FlatButton";
import TextField from "material-ui/TextField";
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Dialog from "metadata-ui/Dialog"
import { getTabsContent, SchemeSettingsTabs } from "./SchemeSettingsTabs"
import styles from "./styles/SchemeSettingsWrapper.scss";

export default class SchemeSettingsWrapper extends Component {
  static propTypes = {
    scheme: PropTypes.object.isRequired,
    handleSchemeChange: PropTypes.func.isRequired,
    tabParams: PropTypes.object,                    // конструктор пользовательской панели параметров
    show_search: PropTypes.bool,                    // показывать поле поиска
    show_variants: PropTypes.bool,                  // показывать список вариантов настройки динсписка
  }

  constructor(props, context) {
    super(props, context);
    const {scheme} = props

    this.state = {
      scheme,
      open: false,
      fullscreen: false,
      variants: [scheme]
    }

    scheme._manager.get_option_list({
      _top: 40,
      obj: scheme.obj,
    })
    .then((variants) => {
      this.setState({variants})
    });
  }

  handleOpen = () => {
    this.setState({
      open: true
    });
  }

  handleClose = () => {
    this.setState({
      open: false
    });
  }

  handleOk = () => {
    this.handleClose();
    this.props.handleSchemeChange(this.state.scheme);
  }

  handleSchemeChange = (scheme) => {
    this.props.handleSchemeChange(scheme)
    this.setState({scheme});
  }

  handleSearchChange = (event, newValue) => {
  }

  handleVariantChange = (event, index, value) => {
    const {_manager} = this.state.scheme;
    this.handleSchemeChange(_manager.get(value));
  }

  componentDidMount = () => {
    if(this.searchInput){
      this.searchInput.input.placeholder = "Найти..."
    }
  }

  handleCloseClick() {
    this.setState({
      open: false
    })
  }

  handleFullscreenClick() {
    this.setState({
      fullscreen: !this.state.fullscreen
    });
  }

  render() {
    const {props, state, handleOpen, handleOk, handleClose, handleSchemeChange, handleSearchChange, handleVariantChange} = this;
    const {open, scheme, variants} = state
    const {show_search, show_variants, tabParams} = props

    const actions = [
      <FlatButton
        key={0}
        label="Отмена"
        secondary={true}
        onTouchTap={handleClose} />,

      <RaisedButton
        key={1}
        label="Применить"
        primary={true}
        onTouchTap={handleOk} />,
    ];

    const menuitems = [];
    if(show_variants && scheme){
      variants.forEach((v) => {
        menuitems.push(<MenuItem value={v.ref} key={v.ref} primaryText={v.name} />);
      })
    }

    return (
      <div className={styles.schemeSettingsWrapper}>
        {/* Search box */}
        {show_search ? <TextField
          name="search"
          ref={(search) => {this.searchInput = search;}}
          width={300}
          underlineShow={false}
          className={styles.searchBox}
          onChange={handleSearchChange}
          disabled /> : null
        }


        {/* Variants */}
        {show_variants && scheme ? <DropDownMenu
          className={styles.schemeVariants}
          maxHeight={300}
          labelStyle={{
            lineHeight: "48px"
          }}
          value={scheme.ref}
          onChange={handleVariantChange}>
          {menuitems}
        </DropDownMenu> : null}


        {/* Show list configuration button */}
        <IconButton touch={true} tooltip="Настройка списка" onTouchTap={handleOpen}>
          <IconSettings />
        </IconButton>

        <Dialog
          title={"Настройка моего списка"}
          actions={actions}
          tabs={getTabsContent(scheme, handleSchemeChange, tabParams)}
          resizable={true}
          visible={open}
          width={700}
          height={500}
          fullscreen={this.state.fullscreen}
          onFullScreenClick={() => this.handleFullscreenClick()}
          onCloseClick={() => this.handleCloseClick()} />
      </div>
    )
  }
}

import React, {Component, PropTypes} from "react";
import CircularProgress from "material-ui/CircularProgress";
import classes from "./DumbLoader.scss";

export default class DumbLoader extends Component {

  static propTypes = {
    step: PropTypes.number,
    step_size: PropTypes.number,
    count_all: PropTypes.number,

    title: PropTypes.string,
    processed: PropTypes.string,
    current: PropTypes.string,
    bottom: PropTypes.string
  }

  static defaultProps = {
    title: "Заставка загрузка модулей..."
  }

  render() {
    return (
      <div className={classes.dumbLoader}>
        <div className={classes.progress} style={{position: 'relative', width: 300}}>{this.props.title}</div>
        <CircularProgress size={120} thickness={5} className={classes.progress}/>
      </div>
    );
  }
}

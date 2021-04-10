import React from "react";
import PropTypes from "prop-types";
import cls from "classnames";

import Style from "./index.module.scss";
import { PageMenuFSM } from "./page_menu_fsm";

const DEFAULTS = {
  offset: 50,
  duration: 300,
};

export const Page = (props) => {
  const { children, title, open, style = {} } = props;
  return (
    <div className={Style.menuItem} style={style}>
      {open ? title : null}
      {children}
    </div>
  );
};

Page.propTypes = {
  title: PropTypes.oneOf([
    PropTypes.string.isRequired,
    PropTypes.element.isRequired,
  ]).isRequired,
  style: PropTypes.shape({}),
};

export class PageMenu extends React.PureComponent {
  static propTypes = {
    defaultOpen: PropTypes.bool.isRequired,
    transitionDuration: PropTypes.number, // ms
    menuItemOffset: PropTypes.number,
    menuIconRenderer: PropTypes.func,
    onOpenStatusChange: PropTypes.func,
    onSelect: PropTypes.func,
  };

  static defaultProps = {
    menuItemOffset: DEFAULTS.offset,
    menuIconRenderer: null,
    onOpenStatusChange: () => null,
    onSelect: () => null,
    transitionDuration: DEFAULTS.duration,
  };

  constructor(props) {
    super(props);
    const childLen = props.children.length;
    this.fsm = new PageMenuFSM(childLen);
    this.state = {
      menuState: PageMenuFSM.CLOSED,
      selectedIndex: childLen,
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.children.length !== this.props.children.length) {
      this.fsm = new PageMenuFSM(this.props.children.length);
    }
  }

  transition = (input) => {
    const currentState = this.state.menuState;
    const menuState = this.fsm.transition(currentState, input);
    if (menuState === undefined) {
      return;
    }

    const output = this.fsm.output(menuState);
    this.setState({ menuState, ...output });
  };

  getItemOffset = (index) => {
    if (index === 0) {
      return 0;
    }

    const { menuItemOffset } = this.props;
    const { isOpen, selectedIndex: activeMenuItemIndex } = this.state;

    const offset = isOpen || index > activeMenuItemIndex ? menuItemOffset : 0;

    return offset * index;
  };

  genMenuItemClickHandler = (index) => (e) => {
    e.stopPropagation();
    this.transition(index);
    this.props.onSelect(index);
  };

  handleIconClick = () => {
    this.transition(PageMenuFSM.CLICK_ICON);
  };

  renderMenuItems = (children) => {
    return children.map((child, index) => {
      const { selectedIndex, isOpen } = this.state;

      const isHidden = index > selectedIndex;
      const offset = this.getItemOffset(index);
      const translate = isHidden
        ? `translate(${offset}px, calc(100% + 20px))`
        : `translate(${offset}px, ${offset}px)`;
      return (
        <div
          className={cls(Style.menuItemContainer)}
          onClick={this.genMenuItemClickHandler(index)}
          style={{
            transform: translate,
            transition: `all ${this.props.transitionDuration}ms`,
          }}
        >
          {React.cloneElement(child, { open: isOpen })}
        </div>
      );
    });
  };

  renderMenuIcon = (isOpen) => {
    const { menuIconRenderer } = this.props;
    const params = { open: this.handleIconClick, isOpen };
    const menuIcon = (
      <div onClick={this.handleIconClick} className={Style.menuIcon}>
        OPEN
      </div>
    );
    if (menuIconRenderer) {
      try {
        return menuIconRenderer(params);
      } catch {
        return menuIcon;
      }
    }
    return menuIcon;
  };

  render() {
    const { children } = this.props;
    const { isOpen } = this.state;
    return (
      <div className={cls(Style.menu)}>
        {this.renderMenuIcon(isOpen)}
        {this.renderMenuItems(children)}
      </div>
    );
  }
}

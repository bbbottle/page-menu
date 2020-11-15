import React from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';

import Style from './index.module.scss';

const DEFAULTS = {
  offset: 50,
  duration: 300,
}

export const Page = (props) => {
  const {
    children,
    title,
    style = {}
  } = props;
  return (
    <div
      className={Style.menuItem}
      style={style}
    >
      {title}
      {children}
    </div>
  )
}

Page.propTypes = {
  title: PropTypes.oneOf([
    PropTypes.string.isRequired,
    PropTypes.element.isRequired
  ]).isRequired,
  style: PropTypes.shape({})
}

export class PageMenu extends React.PureComponent {
  static propTypes = {
    defaultOpen: PropTypes.bool.isRequired,
    transitionDuration: PropTypes.number, // ms
    menuItemOffset: PropTypes.number,
    menuIconRenderer: PropTypes.func,
  }

  static defaultProps = {
    menuItemOffset: DEFAULTS.offset,
    menuIconRenderer: null,
    transitionDuration: DEFAULTS.duration
  }

  constructor(props) {
    super(props);
    this.state = {
      isOpen: !!this.props.defaultOpen,
      activeMenuItemIndex: props.children.length,
    }
  }

  openMenu = () => {
    const { activeMenuItemIndex } = this.state;
    const isAllMenuItemShow = activeMenuItemIndex === this.props.children.length;
    if (isAllMenuItemShow) {
      this.setState({ isOpen: true })
      return;
    }

    const {
      transitionDuration
    } = this.props;
    this.setState({
      isOpen: true
    }, () => {
      setTimeout(() => {
        this.setState({
          activeMenuItemIndex: this.props.children.length,
        })
      }, transitionDuration / 2)
    })
  }

  closeMenu = (activeMenuItemIndex) => {
    const {
      transitionDuration
    } = this.props;
    this.setState({
      activeMenuItemIndex,
    }, () => {
      setTimeout(() => {
        this.setState({ isOpen: false })
      }, transitionDuration)
    })
  }

  genMenuItemClickHandler = (activeMenuItemIndex) => (e) => {
    e.stopPropagation();
    this.closeMenu(activeMenuItemIndex);
  }

  renderMenuItem = (child, index) => {
    const {
      menuItemOffset,
      transitionDuration
    } = this.props;
    const {
      isOpen,
      activeMenuItemIndex
    } = this.state;
    const isHidden = index === activeMenuItemIndex + 1;
    const isFirst = index === 0;
    const offset = isOpen && !isFirst ? menuItemOffset : 0;
    const leftOffset = isHidden && !isFirst ? menuItemOffset : offset;
    return (
      <div
        className={cls(Style.menuItemContainer, {
          [Style.hiddenMenuItemContainer]: isHidden
        })}
        onClick={this.genMenuItemClickHandler(index)}
        style={{
          top: offset,
          left: leftOffset,
          transition: `all ${transitionDuration}ms`
        }}
      >{child}</div>
    )
  }

  renderMenuItems = (children, depth) => {
    if (typeof depth === 'number') {
      depth += 1;
    } else {
      depth = 0;
    }

    if (children.length === 1) {
      return this.renderMenuItem(children, depth)
    }

    const [ first, ...rest] = children;
    return this.renderMenuItem([
      first, this.renderMenuItems(rest, depth)
    ], depth)
  };

  renderMenuIcon = () => {
    const {
      menuIconRenderer
    } = this.props;
    const params = {
      open: this.openMenu,
    };
    const menuIcon = (
      <div
        onClick={this.openMenu}
        className={Style.menuIcon}
      >
        OPEN
      </div>
    );
    if (menuIconRenderer) {
      try {
        return menuIconRenderer(params)
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
      <div
        className={cls(Style.menu)}
      >
        {this.renderMenuItems(children)}
        {!isOpen && this.renderMenuIcon()}
      </div>
    )
  }
}
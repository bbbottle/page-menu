const CLICK_ICON = 'click_icon';

const OPENED = 'opened';
const CLOSED = 'closed';

class PageMenuFSM {
  constructor(pagesCount) {
    this.pagesCount = pagesCount;
    this.pagesIndex = this.buildPagesIndex(pagesCount);
    this.STATE_TRANS_MAP = this.buildStateTransMap();
  }

  transition = (currentState, input) => {
    return this.STATE_TRANS_MAP.get(this.buildStateTransMapKey(currentState, input));
  };

  output = (state) => {
    switch (state) {
      case OPENED:
        return {
          isOpen: true,
          hideIcon: true,
          selectedIndex: this.pagesCount,
        }
      default:
        return {
          isOpen: false,
          hideIcon: false,
          selectedIndex: state,
        }
    }
  };

  buildPagesIndex = (pagesCount) => {
    return Array.from(Array(pagesCount).keys())
  };

  buildStateTransMapKey = (currentState, input) => `${currentState}-${input}`;

  buildStateTransMap = () => {
    const stateTransMap = new Map();

    stateTransMap.set(
      this.buildStateTransMapKey(CLOSED, CLICK_ICON),
      OPENED
    );

    this.pagesIndex.forEach((index) => {
      stateTransMap.set(
        this.buildStateTransMapKey(OPENED, index),
        index
      );
      stateTransMap.set(
        this.buildStateTransMapKey(index, CLICK_ICON),
        OPENED
      );
    });

    return stateTransMap;
  };
}

PageMenuFSM.OPENED = OPENED;
PageMenuFSM.CLOSED = CLOSED;

PageMenuFSM.CLICK_ICON = CLICK_ICON;

export { PageMenuFSM }
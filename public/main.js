class MDCTab {
  static get cssClasses() {
    return {
      ACTIVE: 'mdc-tab--active',
      MULTILINE: 'mdc-tab--multiline',
    };
  }

  constructor(el, parentTabs) {
    this.el_ = el;
    this.parentTabs_ = parentTabs;
    this.computedWidth_ = 0;
    this.computedLeft_ = 0;
    this.preventDefaultOnClick_ = false;
    this.preventDefaultHandler_ = (evt) => evt.preventDefault();
    this.ripple_ = new mdc.ripple.MDCRipple(this.el_);
    this.bindEvents_();
  }

  get computedWidth() {
    return this.computedWidth_;
  }

  get computedLeft() {
    return this.computedLeft_;
  }

  get isActive() {
    return this.el_.classList.contains(MDCTab.cssClasses.ACTIVE);
  }

  get el() {
    return this.el_;
  }

  set isActive(isActive) {
    if (isActive) {
      this.el_.classList.add(MDCTab.cssClasses.ACTIVE);
    }
    else {
      this.el_.classList.remove(MDCTab.cssClasses.ACTIVE);
    }
  }

  get preventDefaultOnClick() {
    return this.preventDefaultOnClick_;
  }

  set preventDefaultOnClick(preventDefaultOnClick) {
    // Ensure preventDefaultOnClick is always a boolean and thus can be compared
    // using a strict equality operator with no ambiguity.
    preventDefaultOnClick = Boolean(preventDefaultOnClick);
    // Prevent event listeners from being redundantly added or unneccessarily removed
    if (preventDefaultOnClick === this.preventDefaultOnClick_) {
      return;
    }
    this.preventDefaultOnClick_ = preventDefaultOnClick;
    const evtName = 'click';
    if (this.preventDefaultOnClick_) {
      this.el_.addEventListener('click', this.preventDefaultHandler_);
    } else {
      this.el_.removeEventListener('click', this.preventDefaultHandler_);
    }
  }

  measureSelf() {
    this.computedWidth_ = this.el_.offsetWidth;
    this.computedLeft_ = this.el_.offsetLeft;
  }

  bindEvents_() {
    this.el_.addEventListener('touchend', (evt) => {
      evt.preventDefault();
      this.switchToThisTab_();
    });
    this.el_.addEventListener('click', () => this.switchToThisTab_());
    this.el_.addEventListener('keydown', (evt) => {
      if (evt.key && evt.key === 'Enter' || evt.keyCode === 13) {
        this.switchToThisTab_();
      }
    });
  }

  switchToThisTab_() {
    this.parentTabs_.switchToTab(this);
  }
}

class MDCTabs {
  static get cssClasses() {
    return {
      UPGRADED: 'mdc-tabs-upgraded',
    };
  }

  static get strings() {
    return {
      INDICATOR_SELECTOR: '.mdc-tabs__indicator',
    };
  }

  constructor(el_) {
    this.el_ = el_;
    this.isIndicatorShown_ = false;
    this.indicator_ = this.el_.querySelector(MDCTabs.strings.INDICATOR_SELECTOR);
    this.tabs_ = this.gatherTabs_();
    this.computedWidth_ = 0;
    this.activeTab_ = this.findActiveTab_();
    this.activeTabIndex_ = 0;
    window.addEventListener('resize', () => requestAnimationFrame(() => this.layout()));
    this.el_.classList.add(MDCTabs.cssClasses.UPGRADED);
    requestAnimationFrame(() => this.layout());
  }

  get activeTab() {
    return this.activeTab_;
  }

  get tabs() {
    return this.tabs_.slice();
  }

  get activeTabIndex() {
    return this.activeTabIndex_;
  }

  get computedWidth() {
    return this.computedWidth_;
  }

  get preventDefaultOnClick() {
    // We can only guarantee preventDefault() will be called for every if, in fact, every
    // tab prevents default on click. If even one tab does not, it's false. Doing things this way
    // ensures the source of truth for this stays within the individual tabs and the tabs component
    // does not go out of sync with the tabs it manages.
    return this.tabs.every((t) => t.preventDefaultOnClick);
  }

  set preventDefaultOnClick(preventDefaultOnClick) {
    this.tabs.forEach((t) => {
      t.preventDefaultOnClick = preventDefaultOnClick;
    });
  }

  switchToTabAtIndex(index) {
    if (index < 0 || index >= this.tabs_.length) {
      throw new RangeError(`(switchToTabAtIndex) invalid index ${index}`);
    }
    this.switchToTab(this.tabs_[index]);
  }

  switchToTab(tab) {
    return this.switchToTab_(tab);
  }

  switchToTab_(tab, index) {
    if (tab === this.activeTab_) {
      return;
    }
    if (arguments.length < 2) {
      index = this.tabs_.indexOf(tab);
      if (index < 0) {
        throw new Error('Asking to switch to tab not controlled by me!');
      }
    }
    const oldActiveTab = this.activeTab_;
    this.activeTab_ = tab;
    this.activeTabIndex_ = index;
    requestAnimationFrame(() => {
      oldActiveTab.isActive = false;
      this.activeTab_.isActive = true;
      this.layoutIndicator_();
      this.emitDidSwitchTab_();
    });
  }

  layout() {
    this.tabs_.forEach((t) => t.measureSelf());
    this.computedWidth_ = this.el_.offsetWidth;
    this.layoutIndicator_();
  }

  layoutIndicator_() {
    // Scale indicator down to width
    // Translate indicator to left position
    const translateAmt = this.activeTab.computedLeft;
    const scaleAmt = this.activeTab.computedWidth / this.computedWidth_;
    if (!this.isIndicatorShown_) {
      this.indicator_.style.transition = 'none';
    }
    this.indicator_.style.transform =
      this.indicator_.style.webkitTransform = `translateX(${translateAmt}px) scaleX(${scaleAmt})`;
    if (!this.isIndicatorShown_) {
      // Need to trigger layout in order for transform styles to take effect.
      this.indicator_.offsetWidth;
      this.indicator_.style.transition = '';
      this.indicator_.style.visibility = 'visible';
      this.isIndicatorShown_ = true;
    }
  }

  emitDidSwitchTab_() {
    const evtName = 'MDCTabs:change';
    var evt;
    try {
      evt = new CustomEvent(evtName, {
        detail: this
      });
    }
    catch (e) {
      evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(evtName, true, true, this);
    }
    this.el_.dispatchEvent(evt);
  }

  findActiveTab_() {
    var activeTab;
    for (let tab of this.tabs_) {
      if (tab.isActive) {
        activeTab = tab;
        break;
      }
    }
    if (!activeTab) {
      activeTab = this.tabs_[0];
    }
    activeTab.isActive = true;
    return activeTab;
  }

  gatherTabs_() {
    const tabEls = this.el_.querySelectorAll('.mdc-tab');
    return [].slice.call(tabEls).map((t) => new MDCTab(t, this));
  }
}

// TODO(traviskaufman): Come up with better UX solve when tabs wrapper scrolls due to tab focusing
// (e.g. on blur, reset scroll offset and translate properly so that active tab is in view.)?
// TODO(traviskaufman): Consider case where tabs inside scroller are adjusted programmatically
// (e.g. should we auto-translate the scroller to keep up with the tabs?).?

class MDCTabsScroller {
  static get cssClasses() {
    return {
      VISIBLE: 'mdc-tabs-scroller--visible',
      FOCUSED_CHILD: 'mdc-tabs-scroller--focused-child',
      INDICATOR_DISABLED: 'mdc-tabs-scroller__indicator--disabled',
    };
  }

  static get strings() {
    return {
      WRAPPER_SELECTOR: '.mdc-tabs-scroller__tabs-wrapper',
      INDICATOR_LEFT_SELECTOR: '.mdc-tabs-scroller__indicator--left',
      INDICATOR_RIGHT_SELECTOR: '.mdc-tabs-scroller__indicator--right',
    }
  }

  constructor(el, tabs) {
    this.el_ = el;
    this.tabs_ = tabs;
    this.tabsWrapper_ = this.el_.querySelector(MDCTabsScroller.strings.WRAPPER_SELECTOR);
    this.leftIndicator_ = this.el_.querySelector(MDCTabsScroller.strings.INDICATOR_LEFT_SELECTOR);
    this.rightIndicator_ = this.el_.querySelector(MDCTabsScroller.strings.INDICATOR_RIGHT_SELECTOR);
    this.pointerDownRecognized_ = false;
    this.computedWrapperWidth_ = 0;
    this.computedWidth_ = 0;
    this.currentTranslateOffset_ = 0;
    this.bindEvents_();
    requestAnimationFrame(() => this.layout());
  }

  get tabs() {
    return this.tabs_;
  }

  bindEvents_() {
    ['touchstart', 'mousedown'].forEach((evtType) => {
      this.el_.addEventListener(evtType, () => {
        this.pointerDownRecognized_ = true;
      }, true);
    });

    this.el_.addEventListener('focus', (evt) => {
      if (this.pointerDownRecognized_) {
        this.el_.classList.remove(MDCTabsScroller.cssClasses.FOCUSED_CHILD);
      }
      else if (!isAncestorOf(evt.target, this.leftIndicator_) &&
               !isAncestorOf(evt.target, this.rightIndicator_)) {
        this.el_.classList.add(MDCTabsScroller.cssClasses.FOCUSED_CHILD);
      }
      this.pointerDownRecognized_ = false;
    }, true);

    this.el_.addEventListener('blur', (evt) => {
      if (!this.el_.classList.contains(MDCTabsScroller.cssClasses.FOCUSED_CHILD)) {
        return;
      }
      if (!evt.relatedTarget || !isAncestorOf(evt.relatedTarget, this.el_)) {
        this.el_.classList.remove(MDCTabsScroller.cssClasses.FOCUSED_CHILD);
      }
    }, true);

    this.leftIndicator_.addEventListener('click', (evt) => {
      evt.preventDefault();
      if (this.leftIndicator_.classList.contains(MDCTabsScroller.cssClasses.INDICATOR_DISABLED)) {
        return;
      }
      this.scrollLeft();
    });

    this.rightIndicator_.addEventListener('click', (evt) => {
      evt.preventDefault();
      if (this.rightIndicator_.classList.contains(MDCTabsScroller.cssClasses.INDICATOR_DISABLED)) {
        return;
      }
      this.scrollRight();
    });

    window.addEventListener('resize', () => requestAnimationFrame(() => this.layout()));
  }

  layout() {
    this.tabs.layout();
    this.computedWrapperWidth_ = this.tabsWrapper_.offsetWidth;
    this.computedWidth_ =
      this.el_.offsetWidth - this.leftIndicator_.offsetWidth - this.rightIndicator_.offsetWidth;
    const isOverflowing = this.el_.offsetWidth < this.computedWrapperWidth_;
    if (isOverflowing) {
      this.el_.classList.add(MDCTabsScroller.cssClasses.VISIBLE);
    }
    else {
      this.el_.classList.remove(MDCTabsScroller.cssClasses.VISIBLE);
      this.currentTranslateOffset_ = 0;
      this.shiftWrapper_();
    }
    this.updateIndicatorEnabledStates_();
  }

  scrollLeft() {
    var tabToScrollTo;
    // TODO better name
    let accum = 0;
    let viewAreaMin = this.currentTranslateOffset_;
    for (let i = this.tabs.tabs.length - 1, tab; tab = this.tabs.tabs[i]; i--) {
      if (tab.computedLeft > viewAreaMin) {
        continue;
      }
      accum += tab.computedWidth;
      if (accum >= this.computedWidth_) {
        tabToScrollTo = tab;
        break;
      }
    }
    if (!tabToScrollTo) {
      if (!accum) {
        return;
      }
      tabToScrollTo = this.tabs.tabs[0];
    }
    this.scrollToTab(tabToScrollTo);
  }

  scrollRight() {
    var tabToScrollTo;
    // TODO better name
    const viewAreaMax = this.currentTranslateOffset_ + this.computedWidth_;
    for (let tab of this.tabs.tabs) {
      if (tab.computedLeft + tab.computedWidth >= viewAreaMax) {
        tabToScrollTo = tab;
        break;
      }
    }
    if (!tabToScrollTo) {
      return;
    }
    this.scrollToTab(tabToScrollTo);
  }

  scrollToTab(tab) {
    this.currentTranslateOffset_ = tab.computedLeft;
    requestAnimationFrame(() => this.shiftWrapper_());
  }

  shiftWrapper_() {
    this.tabsWrapper_.style.transform =
      this.tabsWrapper_.style.webkitTransform = `translateX(${-this.currentTranslateOffset_}px)`;
    this.updateIndicatorEnabledStates_();
  }

  updateIndicatorEnabledStates_() {
    if (this.currentTranslateOffset_ === 0) {
      this.leftIndicator_.classList.add(MDCTabsScroller.cssClasses.INDICATOR_DISABLED);
    }
    else {
      this.leftIndicator_.classList.remove(MDCTabsScroller.cssClasses.INDICATOR_DISABLED);
    }
    if (this.currentTranslateOffset_ + this.computedWidth_ >= this.computedWrapperWidth_) {
      this.rightIndicator_.classList.add(MDCTabsScroller.cssClasses.INDICATOR_DISABLED);
    }
    else {
      this.rightIndicator_.classList.remove(MDCTabsScroller.cssClasses.INDICATOR_DISABLED);
    }
  }
}

function isAncestorOf(el, possibleAncestor) {
  let parent = el;
  while (parent && parent !== possibleAncestor) {
    parent = parent.parentElement;
  }
  return parent === possibleAncestor;
}


// ---
// Tabs Initialization

window.basicTabs = new MDCTabs(
  document.getElementById('basic-tabs')
);

window.scrollableTabs = new MDCTabs(
  document.getElementById('scrollable-tabs')
);

window.tabsScroller = new MDCTabsScroller(
  document.getElementById('tabs-scroller'),
  window.scrollableTabs
);

window.iconTabs = new MDCTabs(
  document.getElementById('icon-tabs')
);

window.iconTextTabs = new MDCTabs(
  document.getElementById('icon-text-tabs')
);

window.toolbarTabs = new MDCTabs(
  document.getElementById('toolbar-tabs')
);

window.primaryIndicatorTabs = new MDCTabs(
  document.getElementById('primary-indicator-tabs')
);

window.accentIndicatorTabs = new MDCTabs(
  document.getElementById('accent-indicator-tabs')
);

window.primaryIndicatorToolbarTabs = new MDCTabs(
  document.getElementById('toolbar-tabs-primary-indicator')
);

window.accentIndicatorToolbarTabs = new MDCTabs(
  document.getElementById('toolbar-tabs-accent-indicator')
);

// ---
// Dynamic Demo Logic

const dynamicTabs = window.dynamicTabs = new MDCTabs(
  document.getElementById('dynamic-tabs')
);
const dots = document.querySelector('.dots');
const panels = document.querySelector('.panels');

dynamicTabs.preventDefaultOnClick = true;
// TODO: this will be .on() when it's an MDCComponent
dynamicTabs.el_.addEventListener('MDCTabs:change', ({detail: tabs}) => {
  const nthChildIndex = tabs.activeTabIndex + 1;
  const activeDot = dots.querySelector('.dot.active');
  if (activeDot) {
    activeDot.classList.remove('active');
  }
  const newActiveDot = dots.querySelector(`.dot:nth-child(${nthChildIndex})`);
  if (newActiveDot) {
    newActiveDot.classList.add('active');
  }

  const activePanel = panels.querySelector('.panel.active');
  if (activePanel) {
    activePanel.classList.remove('active');
  }
  const newActivePanel = panels.querySelector(`.panel:nth-child(${nthChildIndex})`);
  if (newActivePanel) {
    newActivePanel.classList.add('active');
  }
});

dots.addEventListener('click', (evt) => {
  if (!evt.target.classList.contains('dot')) {
    return;
  }
  evt.preventDefault();
  const dotIndex = [].slice.call(dots.querySelectorAll('.dot')).indexOf(evt.target);
  if (dotIndex >= 0) {
    dynamicTabs.switchToTabAtIndex(dotIndex);
  }
});

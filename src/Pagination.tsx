import classNames from 'classnames';
import useMergedState from '@rc-component/util/lib/hooks/useMergedState';
import KeyCode from '@rc-component/util/lib/KeyCode';
import pickAttrs from '@rc-component/util/lib/pickAttrs';
import warning from '@rc-component/util/lib/warning';
import React, { useEffect } from 'react';
import type { PaginationProps } from './interface';
import zhCN from './locale/zh_CN';
import Options from './Options';
import type { PagerProps } from './Pager';
import Pager from './Pager';

const defaultItemRender: PaginationProps['itemRender'] = (_, __, element) =>
  element;

function noop() {}

function isInteger(v: number) {
  const value = Number(v);
  return (
    typeof value === 'number' &&
    !Number.isNaN(value) &&
    isFinite(value) &&
    Math.floor(value) === value
  );
}

function calculatePage(p: number | undefined, pageSize: number, total: number) {
  const _pageSize = typeof p === 'undefined' ? pageSize : p;
  return Math.floor((total - 1) / _pageSize) + 1;
}

const Pagination: React.FC<PaginationProps> = (props) => {
  const {
    // cls
    prefixCls = 'rc-pagination',
    selectPrefixCls = 'rc-select',
    className,
    classNames: paginationClassNames,
    styles,

    // control
    current: currentProp,
    defaultCurrent = 1,
    total = 0,
    pageSize: pageSizeProp,
    defaultPageSize = 10,
    onChange = noop,

    // config
    hideOnSinglePage,
    align,
    showPrevNextJumpers = true,
    showQuickJumper,
    showLessItems,
    showTitle = true,
    onShowSizeChange = noop,
    locale = zhCN,
    style,
    totalBoundaryShowSizeChanger = 50,
    disabled,
    simple,
    showTotal,
    showSizeChanger = total > totalBoundaryShowSizeChanger,
    sizeChangerRender,
    pageSizeOptions,

    // render
    itemRender = defaultItemRender,
    jumpPrevIcon,
    jumpNextIcon,
    prevIcon,
    nextIcon,
  } = props;

  const paginationRef = React.useRef<HTMLUListElement>(null);

  const [pageSize, setPageSize] = useMergedState<number>(10, {
    value: pageSizeProp,
    defaultValue: defaultPageSize,
  });

  const [current, setCurrent] = useMergedState<number>(1, {
    value: currentProp,
    defaultValue: defaultCurrent,
    postState: (c) =>
      Math.max(1, Math.min(c, calculatePage(undefined, pageSize, total))),
  });

  const [internalInputVal, setInternalInputVal] = React.useState(current);

  useEffect(() => {
    setInternalInputVal(current);
  }, [current]);

  const hasOnChange = onChange !== noop;
  const hasCurrent = 'current' in props;

  if (process.env.NODE_ENV !== 'production') {
    warning(
      hasCurrent ? hasOnChange : true,
      'You provided a `current` prop to a Pagination component without an `onChange` handler. This will render a read-only component.',
    );
  }

  const jumpPrevPage = Math.max(1, current - (showLessItems ? 3 : 5));
  const jumpNextPage = Math.min(
    calculatePage(undefined, pageSize, total),
    current + (showLessItems ? 3 : 5),
  );

  function getItemIcon(
    icon: React.ReactNode | React.ComponentType<PaginationProps>,
    label: string,
  ) {
    let iconNode = icon || (
      <button
        type="button"
        aria-label={label}
        className={`${prefixCls}-item-link`}
      />
    );
    if (typeof icon === 'function') {
      iconNode = React.createElement<PaginationProps>(icon, props);
    }
    return iconNode as React.ReactNode;
  }

  function getValidValue(e: any): number {
    const inputValue = e.target.value;
    const allPages = calculatePage(undefined, pageSize, total);
    let value: number;
    if (inputValue === '') {
      value = inputValue;
    } else if (Number.isNaN(Number(inputValue))) {
      value = internalInputVal;
    } else if (inputValue >= allPages) {
      value = allPages;
    } else {
      value = Number(inputValue);
    }
    return value;
  }

  function isValid(page: number) {
    return isInteger(page) && page !== current && isInteger(total) && total > 0;
  }

  const shouldDisplayQuickJumper = total > pageSize ? showQuickJumper : false;

  /**
   * prevent "up arrow" key reseting cursor position within textbox
   * @see https://stackoverflow.com/a/1081114
   */
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.keyCode === KeyCode.UP || event.keyCode === KeyCode.DOWN) {
      event.preventDefault();
    }
  }

  function handleKeyUp(
    event:
      | React.KeyboardEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLInputElement>,
  ) {
    const value = getValidValue(event);
    if (value !== internalInputVal) {
      setInternalInputVal(value);
    }

    switch ((event as React.KeyboardEvent<HTMLInputElement>).keyCode) {
      case KeyCode.ENTER:
        handleChange(value);
        break;
      case KeyCode.UP:
        handleChange(value - 1);
        break;
      case KeyCode.DOWN:
        handleChange(value + 1);
        break;
      default:
        break;
    }
  }

  function handleBlur(event: React.FocusEvent<HTMLInputElement, Element>) {
    handleChange(getValidValue(event));
  }

  function changePageSize(size: number) {
    const newCurrent = calculatePage(size, pageSize, total);
    const nextCurrent =
      current > newCurrent && newCurrent !== 0 ? newCurrent : current;

    setPageSize(size);
    setInternalInputVal(nextCurrent);
    onShowSizeChange?.(current, size);
    setCurrent(nextCurrent);
    onChange?.(nextCurrent, size);
  }

  function handleChange(page: number) {
    if (isValid(page) && !disabled) {
      const currentPage = calculatePage(undefined, pageSize, total);
      let originalPage = page;
      let newPage = page;
      if (page > currentPage) {
        newPage = currentPage;
      } else if (page < 1) {
        newPage = 1;
      }

      if (newPage !== internalInputVal) {
        setInternalInputVal(newPage);
      }

      setCurrent(newPage);
      onChange?.(newPage, pageSize, originalPage);

      return newPage;
    }

    return current;
  }

  const hasPrev = current > 1;
  const hasNext = current < calculatePage(undefined, pageSize, total);

  function prevHandle() {
    if (hasPrev) handleChange(current - 1);
  }

  function nextHandle() {
    if (hasNext) handleChange(current + 1);
  }

  function jumpPrevHandle() {
    handleChange(jumpPrevPage);
  }

  function jumpNextHandle() {
    handleChange(jumpNextPage);
  }

  function runIfEnter(
    event: React.KeyboardEvent<HTMLLIElement>,
    callback: (...args: any[]) => void,
    ...restParams: any[]
  ) {
    if (
      event.key === 'Enter' ||
      event.charCode === KeyCode.ENTER ||
      event.keyCode === KeyCode.ENTER
    ) {
      callback(...restParams);
    }
  }

  function runIfEnterPrev(event: React.KeyboardEvent<HTMLLIElement>) {
    runIfEnter(event, prevHandle);
  }

  function runIfEnterNext(event: React.KeyboardEvent<HTMLLIElement>) {
    runIfEnter(event, nextHandle);
  }

  function runIfEnterJumpPrev(event: React.KeyboardEvent<HTMLLIElement>) {
    runIfEnter(event, jumpPrevHandle);
  }

  function runIfEnterJumpNext(event: React.KeyboardEvent<HTMLLIElement>) {
    runIfEnter(event, jumpNextHandle);
  }

  function renderPrev(prevPage: number) {
    const prevButton = itemRender(
      prevPage,
      'prev',
      getItemIcon(prevIcon, 'prev page'),
    );
    return React.isValidElement<HTMLButtonElement>(prevButton)
      ? React.cloneElement(prevButton, { disabled: !hasPrev })
      : prevButton;
  }

  function renderNext(nextPage: number) {
    const nextButton = itemRender(
      nextPage,
      'next',
      getItemIcon(nextIcon, 'next page'),
    );
    return React.isValidElement<HTMLButtonElement>(nextButton)
      ? React.cloneElement(nextButton, { disabled: !hasNext })
      : nextButton;
  }

  function handleGoTO(event: any) {
    if (event.type === 'click' || event.keyCode === KeyCode.ENTER) {
      handleChange(internalInputVal);
    }
  }

  let jumpPrev: React.ReactElement<PagerProps> = null;

  const dataOrAriaAttributeProps = pickAttrs(props, {
    aria: true,
    data: true,
  });

  const totalText = showTotal && (
    <li className={`${prefixCls}-total-text`}>
      {showTotal(total, [
        total === 0 ? 0 : (current - 1) * pageSize + 1,
        current * pageSize > total ? total : current * pageSize,
      ])}
    </li>
  );

  let jumpNext: React.ReactElement<PagerProps> = null;

  const allPages = calculatePage(undefined, pageSize, total);

  // ================== Render ==================
  // When hideOnSinglePage is true and there is only 1 page, hide the pager
  if (hideOnSinglePage && total <= pageSize) {
    return null;
  }

  const pagerList: React.ReactElement<PagerProps>[] = [];

  const pagerProps: PagerProps = {
    rootPrefixCls: prefixCls,
    onClick: handleChange,
    onKeyPress: runIfEnter,
    showTitle,
    itemRender,
    page: -1,
    className: paginationClassNames?.item,
    style: styles?.item,
  };

  const prevPage = current - 1 > 0 ? current - 1 : 0;
  const nextPage = current + 1 < allPages ? current + 1 : allPages;
  const goButton = showQuickJumper && (showQuickJumper as any).goButton;

  // ================== Simple ==================
  // FIXME: ts type
  const isReadOnly = typeof simple === 'object' ? simple.readOnly : !simple;
  let gotoButton: any = goButton;
  let simplePager: React.ReactNode = null;

  if (simple) {
    // ====== Simple quick jump ======
    if (goButton) {
      if (typeof goButton === 'boolean') {
        gotoButton = (
          <button type="button" onClick={handleGoTO} onKeyUp={handleGoTO}>
            {locale.jump_to_confirm}
          </button>
        );
      } else {
        gotoButton = (
          <span onClick={handleGoTO} onKeyUp={handleGoTO}>
            {goButton}
          </span>
        );
      }

      gotoButton = (
        <li
          title={showTitle ? `${locale.jump_to}${current}/${allPages}` : null}
          className={`${prefixCls}-simple-pager`}
        >
          {gotoButton}
        </li>
      );
    }

    simplePager = (
      <li
        title={showTitle ? `${current}/${allPages}` : null}
        className={`${prefixCls}-simple-pager`}
      >
        {isReadOnly ? (
          internalInputVal
        ) : (
          <input
            type="text"
            aria-label={locale.jump_to}
            value={internalInputVal}
            disabled={disabled}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onChange={handleKeyUp}
            onBlur={handleBlur}
            size={3}
          />
        )}
        <span className={`${prefixCls}-slash`}>/</span>
        {allPages}
      </li>
    );
  }

  // ====================== Normal ======================
  const pageBufferSize = showLessItems ? 1 : 2;
  if (allPages <= 3 + pageBufferSize * 2) {
    if (!allPages) {
      pagerList.push(
        <Pager
          {...pagerProps}
          key="noPager"
          page={1}
          className={`${prefixCls}-item-disabled`}
        />,
      );
    }

    for (let i = 1; i <= allPages; i += 1) {
      pagerList.push(
        <Pager {...pagerProps} key={i} page={i} active={current === i} />,
      );
    }
  } else {
    const prevItemTitle = showLessItems ? locale.prev_3 : locale.prev_5;
    const nextItemTitle = showLessItems ? locale.next_3 : locale.next_5;

    const jumpPrevContent = itemRender(
      jumpPrevPage,
      'jump-prev',
      getItemIcon(jumpPrevIcon, 'prev page'),
    );
    const jumpNextContent = itemRender(
      jumpNextPage,
      'jump-next',
      getItemIcon(jumpNextIcon, 'next page'),
    );

    if (showPrevNextJumpers) {
      jumpPrev = jumpPrevContent ? (
        <li
          title={showTitle ? prevItemTitle : null}
          key="prev"
          onClick={jumpPrevHandle}
          tabIndex={0}
          onKeyDown={runIfEnterJumpPrev}
          className={classNames(`${prefixCls}-jump-prev`, {
            [`${prefixCls}-jump-prev-custom-icon`]: !!jumpPrevIcon,
          })}
        >
          {jumpPrevContent}
        </li>
      ) : null;

      jumpNext = jumpNextContent ? (
        <li
          title={showTitle ? nextItemTitle : null}
          key="next"
          onClick={jumpNextHandle}
          tabIndex={0}
          onKeyDown={runIfEnterJumpNext}
          className={classNames(`${prefixCls}-jump-next`, {
            [`${prefixCls}-jump-next-custom-icon`]: !!jumpNextIcon,
          })}
        >
          {jumpNextContent}
        </li>
      ) : null;
    }

    let left = Math.max(1, current - pageBufferSize);
    let right = Math.min(current + pageBufferSize, allPages);

    if (current - 1 <= pageBufferSize) {
      right = 1 + pageBufferSize * 2;
    }
    if (allPages - current <= pageBufferSize) {
      left = allPages - pageBufferSize * 2;
    }

    for (let i = left; i <= right; i += 1) {
      pagerList.push(
        <Pager {...pagerProps} key={i} page={i} active={current === i} />,
      );
    }

    if (current - 1 >= pageBufferSize * 2 && current !== 1 + 2) {
      pagerList[0] = React.cloneElement<PagerProps>(pagerList[0], {
        className: classNames(
          `${prefixCls}-item-after-jump-prev`,
          pagerList[0].props.className,
        ),
      });

      pagerList.unshift(jumpPrev);
    }

    if (allPages - current >= pageBufferSize * 2 && current !== allPages - 2) {
      const lastOne = pagerList[pagerList.length - 1];
      pagerList[pagerList.length - 1] = React.cloneElement(lastOne, {
        className: classNames(
          `${prefixCls}-item-before-jump-next`,
          lastOne.props.className,
        ),
      });

      pagerList.push(jumpNext);
    }

    if (left !== 1) {
      pagerList.unshift(<Pager {...pagerProps} key={1} page={1} />);
    }
    if (right !== allPages) {
      pagerList.push(<Pager {...pagerProps} key={allPages} page={allPages} />);
    }
  }

  let prev = renderPrev(prevPage);
  if (prev) {
    const prevDisabled = !hasPrev || !allPages;
    prev = (
      <li
        title={showTitle ? locale.prev_page : null}
        onClick={prevHandle}
        tabIndex={prevDisabled ? null : 0}
        onKeyDown={runIfEnterPrev}
        className={classNames(`${prefixCls}-prev`, paginationClassNames?.item, {
          [`${prefixCls}-disabled`]: prevDisabled,
        })}
        style={styles?.item}
        aria-disabled={prevDisabled}
      >
        {prev}
      </li>
    );
  }

  let next = renderNext(nextPage);
  if (next) {
    let nextDisabled: boolean, nextTabIndex: number | null;

    if (simple) {
      nextDisabled = !hasNext;
      nextTabIndex = hasPrev ? 0 : null;
    } else {
      nextDisabled = !hasNext || !allPages;
      nextTabIndex = nextDisabled ? null : 0;
    }

    next = (
      <li
        title={showTitle ? locale.next_page : null}
        onClick={nextHandle}
        tabIndex={nextTabIndex}
        onKeyDown={runIfEnterNext}
        className={classNames(`${prefixCls}-next`, paginationClassNames?.item, {
          [`${prefixCls}-disabled`]: nextDisabled,
        })}
        style={styles?.item}
        aria-disabled={nextDisabled}
      >
        {next}
      </li>
    );
  }

  const cls = classNames(prefixCls, className, {
    [`${prefixCls}-start`]: align === 'start',
    [`${prefixCls}-center`]: align === 'center',
    [`${prefixCls}-end`]: align === 'end',
    [`${prefixCls}-simple`]: simple,
    [`${prefixCls}-disabled`]: disabled,
  });

  return (
    <ul
      className={cls}
      style={style}
      ref={paginationRef}
      {...dataOrAriaAttributeProps}
    >
      {totalText}
      {prev}
      {simple ? simplePager : pagerList}
      {next}
      <Options
        locale={locale}
        rootPrefixCls={prefixCls}
        disabled={disabled}
        selectPrefixCls={selectPrefixCls}
        changeSize={changePageSize}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        quickGo={shouldDisplayQuickJumper ? handleChange : null}
        goButton={gotoButton}
        showSizeChanger={showSizeChanger}
        sizeChangerRender={sizeChangerRender}
      />
    </ul>
  );
};

if (process.env.NODE_ENV !== 'production') {
  Pagination.displayName = 'Pagination';
}

export default Pagination;

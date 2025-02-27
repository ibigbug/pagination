import type { RenderResult } from '@testing-library/react';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import Pagination from '../src';
import { resetWarned } from '@rc-component/util/lib/warning';
import { sizeChangerRender } from './commonUtil';

describe('Default Pagination', () => {
  let wrapper: RenderResult;
  const onChange = jest.fn();
  const $$ = (selector: string) => wrapper.container.querySelectorAll(selector);

  beforeEach(() => {
    wrapper = render(<Pagination onChange={onChange} />);
  });

  afterEach(() => {
    wrapper.unmount();
    onChange.mockReset();
  });

  it('onChange should be forbidden when total is default', () => {
    const pagers = $$('.rc-pagination-item');
    fireEvent.click(pagers[0]);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('Uncontrolled Pagination', () => {
  let wrapper: RenderResult;
  const onChange = jest.fn();
  const $$ = (selector: string) => wrapper.container.querySelectorAll(selector);

  function shouldHighlightRight(current = 1) {
    const pagers = $$('li:not(.rc-pagination-total-text)');
    Array.from(pagers).forEach((pager, index) => {
      if (index === current) {
        expect(pager).toHaveClass('rc-pagination-item-active');
      } else {
        expect(pager).not.toHaveClass('rc-pagination-item-active');
      }
    });
  }

  beforeEach(() => {
    wrapper = render(
      <Pagination
        defaultCurrent={1}
        onChange={onChange}
        total={25}
        showQuickJumper={{ goButton: true }}
        showTotal={(total, range) =>
          `${range[0]} - ${range[1]} of ${total} items`
        }
      />,
    );
  });

  afterEach(() => {
    wrapper.unmount();
    onChange.mockReset();
  });

  it('default current page is 1', () => {
    expect(
      wrapper.container.querySelector('.rc-pagination-item-active'),
    ).toHaveTextContent('1');
    expect($$('.rc-pagination-item')[0]).toHaveTextContent('1');
    expect($$('.rc-pagination-item')[0]).toHaveAttribute('title', '1');
  });

  it('prev-button should be disabled', () => {
    const prevButton = wrapper.container.querySelector('.rc-pagination-prev');
    expect(prevButton).toHaveClass('rc-pagination-disabled');
    expect(prevButton).toHaveAttribute('aria-disabled', 'true');
  });

  it('should hightlight current page and not highlight other page', () =>
    shouldHighlightRight());

  it('should calc page right', () => {
    const pagers = $$(
      'li:not(.rc-pagination-total-text):not(.rc-pagination-options)',
    );
    const knownPageCount = 3;
    const buttonLength = 2;
    expect(pagers.length).toBe(knownPageCount + buttonLength);
  });

  it('next button should not be disabled', () => {
    const nextButton = wrapper.container.querySelector('.rc-pagination-next');
    expect(nextButton).not.toHaveClass('rc-pagination-disabled');
    expect(nextButton).toHaveAttribute('aria-disabled', 'false');
  });

  it('should response mouse click right', () => {
    const pagers = $$('.rc-pagination-item');
    expect(pagers).toHaveLength(3);
    const page2 = pagers[1];
    expect(page2).toHaveClass('rc-pagination-item-2');
    fireEvent.click(page2);
    expect(
      wrapper.container.querySelector('.rc-pagination-item-active'),
    ).toHaveTextContent('2');
    expect(onChange).toHaveBeenLastCalledWith(2, 10);
    shouldHighlightRight(2);
  });

  it('should response next page', () => {
    const nextButton = wrapper.container.querySelector('.rc-pagination-next');
    fireEvent.click(nextButton);
    expect(
      wrapper.container.querySelector('.rc-pagination-item-active'),
    ).toHaveTextContent('2');
    expect(onChange).toHaveBeenLastCalledWith(2, 10);
    shouldHighlightRight(2);
  });

  it('should quick jump to expect page', () => {
    const quickJumper = wrapper.container.querySelector(
      '.rc-pagination-options-quick-jumper',
    );
    const input = quickJumper.querySelector('input');
    const goButton = quickJumper.querySelector(
      '.rc-pagination-options-quick-jumper-button',
    );
    fireEvent.change(input, { target: { value: '2' } });
    fireEvent.click(goButton);
    expect(
      wrapper.container.querySelector('.rc-pagination-item-active'),
    ).toHaveTextContent('2');
    expect(onChange).toHaveBeenLastCalledWith(2, 10);
  });

  // https://github.com/ant-design/ant-design/issues/17763
  it('should not jump when blur input when there is goButton', () => {
    const input = wrapper.container.querySelector(
      '.rc-pagination-options-quick-jumper input',
    );
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '2' } });
    fireEvent.blur(input);
    expect(
      wrapper.container.querySelector('.rc-pagination-item-active'),
    ).toHaveTextContent('1');

    expect(onChange).not.toHaveBeenCalled();
  });

  // https://github.com/ant-design/ant-design/issues/17763
  it('should not jump when blur input when there is not goButton', () => {
    const { container } = render(
      <Pagination pageSize={10} total={20} showQuickJumper />,
    );
    const input = container.querySelector(
      '.rc-pagination-options-quick-jumper input',
    );
    fireEvent.change(input, { target: { value: '2' } });
    fireEvent.blur(input);
    expect(
      container.querySelector('.rc-pagination-item-active'),
    ).toHaveTextContent('2');
  });

  // https://github.com/ant-design/ant-design/issues/15539
  it('should hide quick jumper when only one page', () => {
    const { container } = render(
      <Pagination pageSize={10} total={10} showQuickJumper />,
    );
    const quickJumper = container.querySelectorAll(
      '.rc-pagination-options-quick-jumper',
    );
    expect(quickJumper).toHaveLength(0);
  });

  it('should display total items', () => {
    const totalText = wrapper.container.querySelector(
      '.rc-pagination-total-text',
    );
    expect(totalText).toHaveTextContent('1 - 10 of 25 items');
    const nextButton = wrapper.container.querySelector('.rc-pagination-next');
    fireEvent.click(nextButton);
    expect(totalText).toHaveTextContent('11 - 20 of 25 items');
    fireEvent.click(nextButton);
    expect(totalText).toHaveTextContent('21 - 25 of 25 items');
  });

  it('readonly warning should be displayed', () => {
    resetWarned();
    const warnSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<Pagination current={2} />);
    expect(warnSpy).toHaveBeenCalledWith(
      'Warning: You provided a `current` prop to a Pagination component without an `onChange` handler. This will render a read-only component.',
    );
    warnSpy.mockRestore();
  });

  it('should response keyboard event', () => {
    const pagers = $$('.rc-pagination-item');
    fireEvent.keyDown(pagers[2], { key: 'Enter', keyCode: 13, which: 13 });
    expect(
      wrapper.container.querySelector('.rc-pagination-item-active'),
    ).toHaveTextContent('3');
    expect(onChange).toHaveBeenLastCalledWith(3, 10);
  });
});

describe('Controlled Pagination', () => {
  let wrapper: RenderResult;
  const onChange = jest.fn();

  beforeEach(() => {
    wrapper = render(<Pagination current={2} onChange={onChange} total={25} />);
  });

  afterEach(() => {
    wrapper.unmount();
    onChange.mockReset();
  });

  it('current should equal defaultCurrent', () => {
    expect(
      wrapper.container.querySelector('.rc-pagination-item-active'),
    ).toHaveTextContent('2');
    expect(
      wrapper.container.querySelector('.rc-pagination-item'),
    ).toHaveTextContent('1');
    expect(
      wrapper.container.querySelectorAll('.rc-pagination-item')[1],
    ).toHaveClass('rc-pagination-item-active');
  });

  it('should not response mouse click', () => {
    const nextButton = wrapper.container.querySelector('.rc-pagination-next');
    fireEvent.click(nextButton);
    expect(
      wrapper.container.querySelector('.rc-pagination-item-active'),
    ).toHaveTextContent('2');
    expect(onChange).toHaveBeenLastCalledWith(3, 10);
  });
});

describe('Other props', () => {
  it('support classnames and styles', () => {
    const { container } = render(
      <Pagination
        total={1000}
        current={12}
        classNames={{ item: 'custom-test' }}
        styles={{ item: { color: 'red' } }}
      />,
    );
    const item = container.querySelector('.rc-pagination-item');
    const prev = container.querySelector('.rc-pagination-prev');
    const next = container.querySelector('.rc-pagination-next');
    expect(item).toHaveClass('custom-test');
    expect(prev).toHaveClass('custom-test');
    expect(next).toHaveClass('custom-test');
    expect(item).toHaveStyle('color: red');
    expect(prev).toHaveStyle('color: red');
    expect(next).toHaveStyle('color: red');
  });
  it('should have 5 items when there are 3 pages and current page is 2', () => {
    const { container } = render(
      <Pagination
        total={15}
        pageSize={5}
        current={2}
        classNames={{ item: 'custom-test' }}
      />,
    );
    const items = container.querySelectorAll('.custom-test');
    expect(items.length).toBe(5);
  });
  it('should support custom default icon', () => {
    const nextIcon = () => <span>nextIcon</span>;
    const prevIcon = () => <span>prevIcon</span>;
    const jumpNextIcon = () => <span>jumpNextIcon</span>;
    const jumpPrevIcon = () => <span>jumpPrevIcon</span>;
    const iconsProps = {
      prevIcon,
      nextIcon,
      jumpPrevIcon,
      jumpNextIcon,
    };
    const { container } = render(
      <Pagination total={1000} current={12} {...iconsProps} />,
    );
    const prev = container.querySelector('.rc-pagination-prev');
    const next = container.querySelector('.rc-pagination-next');
    const jumpPrev = container.querySelector('.rc-pagination-jump-prev');
    const jumpNext = container.querySelector('.rc-pagination-jump-next');
    expect(prev).toHaveTextContent('prevIcon');
    expect(next).toHaveTextContent('nextIcon');
    expect(jumpPrev).toHaveTextContent('jumpPrevIcon');
    expect(jumpNext).toHaveTextContent('jumpNextIcon');
  });

  describe('showPrevNextJumpers props', () => {
    it('should hide jump-prev, jump-next if showPrevNextJumpers equals false', () => {
      const { container } = render(
        <Pagination total={1000} current={12} showPrevNextJumpers={false} />,
      );
      const prev = container.querySelector('.rc-pagination-jump-prev');
      const next = container.querySelector('.rc-pagination-jump-next');
      expect(prev).toBeNull();
      expect(next).toBeNull();
    });

    it('should show jump-prev, jump-next if showPrevNextJumpers equals true', () => {
      const { container } = render(
        <Pagination total={1000} current={12} showPrevNextJumpers />,
      );
      const prev = container.querySelector('.rc-pagination-jump-prev');
      const next = container.querySelector('.rc-pagination-jump-next');
      expect(prev).toBeTruthy();
      expect(next).toBeTruthy();
    });
  });

  describe('hideOnSinglePage props', () => {
    const itemRender = (current) => <a href={`#${current}`}>{current}</a>;

    it('should hide pager if hideOnSinglePage equals true', () => {
      const { container } = render(
        <Pagination total={10} itemRender={itemRender} hideOnSinglePage />,
      );
      expect(container.querySelector('.rc-pagination')).toBeFalsy();
    });

    it('should show pager if hideOnSinglePage equals false', () => {
      const { container } = render(
        <Pagination
          total={10}
          itemRender={itemRender}
          hideOnSinglePage={false}
        />,
      );
      expect(container.querySelector('.rc-pagination')).toBeTruthy();
    });

    it('should show pager if hideOnSinglePage equals true but more than 1 page', () => {
      const { container } = render(
        <Pagination
          total={10}
          pageSize={5}
          itemRender={itemRender}
          hideOnSinglePage={false}
        />,
      );
      expect(container.querySelector('.rc-pagination')).toBeTruthy();
    });
  });

  describe('should support align props', () => {
    it('should support align to start', () => {
      const { container } = render(<Pagination align="start" />);
      expect(container.querySelector('.rc-pagination-start')).toBeTruthy();
    });
    it('should support align to center', () => {
      const { container } = render(<Pagination align="center" />);
      expect(container.querySelector('.rc-pagination-center')).toBeTruthy();
    });
    it('should support align to end', () => {
      const { container } = render(<Pagination align="end" />);
      expect(container.querySelector('.rc-pagination-end')).toBeTruthy();
    });
  });

  it('disabled', () => {
    const { container, getByRole } = render(
      <Pagination
        // selectComponentClass={Select}
        sizeChangerRender={sizeChangerRender}
        showQuickJumper={{ goButton: true }}
        showSizeChanger
        defaultPageSize={20}
        defaultCurrent={5}
        total={450}
        disabled
      />,
    );
    expect(container.querySelector('.rc-pagination-disabled')).toBeTruthy();
    expect(container.querySelector('input')).toBeTruthy();
    expect(getByRole('combobox')).toBeDisabled();
    expect(container.querySelector('input')).toBeDisabled();
    expect(
      container.querySelector('.rc-pagination-options-quick-jumper-button'),
    ).toBeDisabled();
  });
});

// https://github.com/ant-design/ant-design/issues/10524
describe('current value on onShowSizeChange when total is 0', () => {
  let wrapper: RenderResult;
  const onShowSizeChange = jest.fn();
  const onChange = jest.fn();

  beforeEach(() => {
    wrapper = render(
      <Pagination
        // selectComponentClass={Select}
        sizeChangerRender={sizeChangerRender}
        showSizeChanger
        onShowSizeChange={onShowSizeChange}
        onChange={onChange}
        current={1}
        total={0}
        showTotal={(total, range) =>
          `${range[0]} - ${range[1]} of ${total} items`
        }
      />,
    );
  });

  afterEach(() => {
    wrapper.unmount();
    onShowSizeChange.mockReset();
    onChange.mockReset();
  });

  it('should not call onShowSizeChange when no change', () => {
    const sizeChanger = wrapper.container.querySelector(
      '.rc-pagination-options-size-changer',
    );
    fireEvent.click(sizeChanger);
    const input = sizeChanger.querySelector('input');
    fireEvent.keyDown(input, { key: 'Down', keyCode: 40, which: 40 });
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 13, which: 13 });
    expect(onShowSizeChange).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('current should equal to the current in onShowSizeChange', () => {
    const sizeChanger = wrapper.container.querySelector(
      '.rc-pagination-options-size-changer',
    );
    fireEvent.click(sizeChanger);
    const input = sizeChanger.querySelector('input');
    fireEvent.keyDown(input, { key: 'Down', keyCode: 40, which: 40 });
    fireEvent.keyDown(input, { key: 'Down', keyCode: 40, which: 40 });
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 13, which: 13 });
    expect(onShowSizeChange).toHaveBeenLastCalledWith(1, 20);
    expect(onChange).toHaveBeenLastCalledWith(1, 20);
  });

  it('when total is 0, pager should show `1` and being disabled', () => {
    const itemButton = wrapper.container.querySelector('.rc-pagination-item');
    expect(itemButton).toHaveClass('rc-pagination-item-disabled');
    expect(itemButton).toHaveTextContent('1');
  });

  it('when total is 0, `from` and `to` should be 0', () => {
    expect(
      wrapper.container.querySelector('.rc-pagination-total-text'),
    ).toHaveTextContent('0 - 0 of 0 items');
  });

  it('size changer show logic', () => {
    const wrapper1 = render(
      <Pagination
        // selectComponentClass={Select}
        sizeChangerRender={sizeChangerRender}
        total={50}
      />,
    );
    expect(
      wrapper1.container.querySelector('.rc-pagination-options-size-changer'),
    ).toBeFalsy();
    const wrapper2 = render(
      <Pagination
        // selectComponentClass={Select}
        sizeChangerRender={sizeChangerRender}
        total={51}
      />,
    );
    expect(
      wrapper2.container.querySelector('.rc-pagination-options-size-changer'),
    ).toBeTruthy();
    const wrapper3 = render(
      <Pagination
        // selectComponentClass={Select}
        sizeChangerRender={sizeChangerRender}
        showSizeChanger={false}
        total={51}
      />,
    );
    expect(
      wrapper3.container.querySelector('.rc-pagination-options-size-changer'),
    ).toBeFalsy();
    const wrapper4 = render(
      <Pagination
        // selectComponentClass={Select}
        sizeChangerRender={sizeChangerRender}
        showSizeChanger
        total={50}
      />,
    );
    expect(
      wrapper4.container.querySelector('.rc-pagination-options-size-changer'),
    ).toBeTruthy();
  });

  it('totalBoundaryShowSizeChanger works', () => {
    const wrapper1 = render(
      <Pagination
        // selectComponentClass={Select}
        sizeChangerRender={sizeChangerRender}
        total={100}
        totalBoundaryShowSizeChanger={100}
      />,
    );
    expect(
      wrapper1.container.querySelector('.rc-pagination-options-size-changer'),
    ).toBeFalsy();
    const wrapper2 = render(
      <Pagination
        // selectComponentClass={Select}
        sizeChangerRender={sizeChangerRender}
        total={101}
        totalBoundaryShowSizeChanger={100}
      />,
    );
    expect(
      wrapper2.container.querySelector('.rc-pagination-options-size-changer'),
    ).toBeTruthy();
    const wrapper3 = render(
      <Pagination
        // selectComponentClass={Select}
        sizeChangerRender={sizeChangerRender}
        showSizeChanger={false}
        total={101}
        totalBoundaryShowSizeChanger={100}
      />,
    );
    expect(
      wrapper3.container.querySelector('.rc-pagination-options-size-changer'),
    ).toBeFalsy();
    const wrapper4 = render(
      <Pagination
        // selectComponentClass={Select}
        sizeChangerRender={sizeChangerRender}
        showSizeChanger
        total={100}
        totalBoundaryShowSizeChanger={100}
      />,
    );
    expect(
      wrapper4.container.querySelector('.rc-pagination-options-size-changer'),
    ).toBeTruthy();
  });
});

describe('should emit onChange when total is string', () => {
  let wrapper: RenderResult;
  const onChange = jest.fn();

  beforeEach(() => {
    wrapper = render(
      // @ts-ignore
      <Pagination total="100" pageSize={10} onChange={onChange} />,
    );
  });

  afterEach(() => {
    wrapper.unmount();
    onChange.mockReset();
  });

  it('onChange should be called when click page', () => {
    const pagers = wrapper.container.querySelectorAll('.rc-pagination-item-3');
    fireEvent.click(pagers[0]);
    expect(onChange).toHaveBeenCalledWith(3, 10);
  });
});

describe('keyboard support', () => {
  let wrapper: RenderResult;
  const onChange = jest.fn();
  const $ = (selector: string) => wrapper.container.querySelector(selector);

  beforeEach(() => {
    wrapper = render(
      <Pagination defaultCurrent={50} total={1000} onChange={onChange} />,
    );
  });

  afterEach(() => {
    wrapper.unmount();
    onChange.mockReset();
  });

  it('should work for prev page', () => {
    const prevButton = $('li.rc-pagination-prev');
    expect(prevButton).toBeTruthy();

    fireEvent.click(prevButton);
    fireEvent.click(prevButton);

    fireEvent.keyDown(prevButton, { key: 'Enter', keyCode: 13, which: 13 });
    fireEvent.keyDown(prevButton, { key: 'Enter', keyCode: 13, which: 13 });

    expect(onChange).toHaveBeenLastCalledWith(46, 10);
  });

  it('should work for next page', () => {
    const nextButton = $('li.rc-pagination-next');
    expect(nextButton).toBeTruthy();

    fireEvent.keyDown(nextButton, { key: 'Enter', keyCode: 13, which: 13 });
    fireEvent.keyDown(nextButton, { key: 'Enter', keyCode: 13, which: 13 });

    fireEvent.click(nextButton);
    fireEvent.click(nextButton);

    expect(onChange).toHaveBeenLastCalledWith(54, 10);
  });

  it('should work for jump prev page', () => {
    const jumpPrevButton = $('li.rc-pagination-jump-prev');
    expect(jumpPrevButton).toBeTruthy();

    fireEvent.keyDown(jumpPrevButton, { key: 'Enter', keyCode: 13, which: 13 });
    fireEvent.click(jumpPrevButton);

    expect(onChange).toHaveBeenLastCalledWith(40, 10);
  });

  it('should work for jump next page', () => {
    const jumpNextButton = $('li.rc-pagination-jump-next');
    expect(jumpNextButton).toBeTruthy();

    fireEvent.click(jumpNextButton);
    fireEvent.keyDown(jumpNextButton, { key: 'Enter', keyCode: 13, which: 13 });

    expect(onChange).toHaveBeenLastCalledWith(60, 10);
  });

  it('should work for enter key', () => {
    const item50 = $('li.rc-pagination-item-50');
    const item51 = $('li.rc-pagination-item-51');
    const item52 = $('li.rc-pagination-item-52');
    const nextButton = $('li.rc-pagination-next');
    const prevButton = $('li.rc-pagination-prev');

    expect(item50).toHaveClass('rc-pagination-item-active');
    fireEvent.click(nextButton);
    expect(item51).toHaveClass('rc-pagination-item-active');
    fireEvent.keyDown(nextButton, { key: 'Enter', keyCode: 13, which: 13 });
    expect(item52).toHaveClass('rc-pagination-item-active');
    fireEvent.click(prevButton);
    expect(item51).toHaveClass('rc-pagination-item-active');
    fireEvent.keyDown(prevButton, { key: 'Enter', keyCode: 13, which: 13 });
    expect(item50).toHaveClass('rc-pagination-item-active');
  });
});

describe('select in sequence', () => {
  const serializeCls = (items: NodeListOf<HTMLLIElement>) =>
    Array.from(items).map((item) =>
      item.getAttribute('class').replaceAll('rc-pagination-', ''),
    );

  function sequenceSelector(total: number) {
    describe(`should sequence select ${total} pages`, () => {
      const { container } = render(<Pagination total={total} current={1} />);
      const cls = serializeCls(container.querySelectorAll('li'));
      expect(cls).toMatchSnapshot();

      const pages = Math.floor((total - 1) / 10) + 1;
      for (let i = 2; i <= pages; i++) {
        it(`should select page ${i}`, () => {
          const { container: pageContainer } = render(
            <Pagination total={total} current={i} />,
          );
          const clsString = serializeCls(pageContainer.querySelectorAll('li'));
          expect(clsString).toMatchSnapshot();
        });
      }
    });
  }
  // coped examples/basic.tsx
  sequenceSelector(25);
  sequenceSelector(50);
  sequenceSelector(60);
  sequenceSelector(70);
  sequenceSelector(80);
  sequenceSelector(90);
  sequenceSelector(100);
  sequenceSelector(120);
  sequenceSelector(500);
});

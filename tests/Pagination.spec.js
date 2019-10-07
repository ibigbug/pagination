/* eslint func-names: 0, no-console: 0 */
import expect from 'expect.js';
import Pagination from '../src';
import Select from 'rc-select';
import React from 'react';
import TestUtils from 'react-dom/test-utils';
import ReactDOM from 'react-dom';
import TwoPagination from './helper/two-pagination';

const Simulate = TestUtils.Simulate;

describe('Uncontrolled Pagination', () => {
  let pagination = null;
  const container = document.createElement('div');
  document.body.appendChild(container);

  let current = 1;
  let pageSize;
  function onChange(page, pSize) {
    current = page;
    pageSize = pSize;
  }

  function shouldHighlightRight() {
    const pagers = TestUtils.scryRenderedDOMComponentsWithTag(pagination, 'li')
      .filter(pager => pager.className.indexOf('rc-pagination-total-text') === -1);
    const current2 = pagination.state.current;
    pagers.forEach((pager, index) => {
      // page starts from 1
      if (index === current2) {
        expect(pager.className).to.contain('rc-pagination-item-active');
      } else {
        expect(pager.className).to.not.contain('rc-pagination-item-active');
      }
    });
  }

  beforeEach((done) => {
    ReactDOM.render(
      <Pagination
        onChange={onChange}
        defaultCurrent={1}
        total={25}
        showQuickJumper={{ goButton: true }}
        showTotal={(total, range) => `${range[0]} - ${range[1]} of ${total} items`}
      />,
      container,
      function () {
        pagination = this;
        done();
      },
    );
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    current = 1;
  });

  it('default current page is 1', () => {
    const current2 = pagination.state.current;
    expect(current2).to.be(1);
  });

  it('prev-button should be disabled', () => {
    const prevButton = TestUtils.findRenderedDOMComponentWithClass(
      pagination,
      'rc-pagination-prev'
    );
    expect(TestUtils.isDOMComponent(prevButton)).to.be(true);
    expect(prevButton.className).to.contain('rc-pagination-disabled');
    expect(prevButton.getAttribute('aria-disabled')).to.equal('true');
  });

  it('should hightlight current page and not highlight other page', shouldHighlightRight);

  it('should calc page right', () => {
    const pagers = TestUtils.scryRenderedDOMComponentsWithTag(pagination, 'li')
      .filter(pager => pager.className.indexOf('rc-pagination-total-text') === -1)
      .filter(pager => pager.className.indexOf('rc-pagination-options') === -1);
    const knownPageCount = 3;
    const buttonLength = 2;
    expect(pagers.length).to.be(knownPageCount + buttonLength);
  });

  it('next button should not be disabled', () => {
    const nextButton = TestUtils.findRenderedDOMComponentWithClass(
      pagination,
      'rc-pagination-next'
    );

    expect(TestUtils.isDOMComponent(nextButton)).to.be(true);
    expect(nextButton.className).to.not.contain('rc-pagination-disabled');
    expect(nextButton.getAttribute('aria-disabled')).to.equal('false');
  });

  it('should response mouse click right', (done) => {
    const pagers = TestUtils.scryRenderedDOMComponentsWithClass(pagination, 'rc-pagination-item');
    expect(pagers.length).to.be(3);
    const page2 = pagers[1];
    expect(TestUtils.isDOMComponent(page2)).to.be(true);
    expect(page2.className).to.contain('rc-pagination-item-2');

    Simulate.click(page2);
    setTimeout(() => {
      expect(pagination.state.current).to.be(2);
      expect(current).to.be(2);
      expect(pageSize).to.be(10);
      shouldHighlightRight();
      done();
    }, 10);
  });

  it('should response next page', (done) => {
    const nextButton = TestUtils.findRenderedDOMComponentWithClass(
      pagination,
      'rc-pagination-next'
    );
    expect(TestUtils.isDOMComponent(nextButton)).to.be(true);
    Simulate.click(nextButton);
    setTimeout(() => {
      expect(pagination.state.current).to.be(2);
      expect(current).to.be(2);
      expect(pageSize).to.be(10);
      done();
    }, 10);
  });

  it('should quick jump to expect page', (done) => {
    const quickJumper = TestUtils.findRenderedDOMComponentWithClass(
      pagination,
      'rc-pagination-options-quick-jumper'
    );
    const input = quickJumper.querySelector('input');
    const goButton = quickJumper.querySelector('button');
    expect(TestUtils.isDOMComponent(quickJumper)).to.be(true);
    expect(TestUtils.isDOMComponent(input)).to.be(true);
    expect(TestUtils.isDOMComponent(goButton)).to.be(true);
    Simulate.change(input, { target: { value: '2' } });
    setTimeout(() => {
      Simulate.click(goButton);
      setTimeout(() => {
        expect(pagination.state.current).to.be(2);
        expect(current).to.be(2);
        expect(pageSize).to.be(10);
        done();
      }, 10);
    }, 10);
  });

  // https://github.com/ant-design/ant-design/issues/17763
  it('should not jump when blur input when there is goButton', (done) => {
    const quickJumper = TestUtils.findRenderedDOMComponentWithClass(
      pagination,
      'rc-pagination-options-quick-jumper'
    );
    const input = quickJumper.querySelector('input');
    Simulate.change(input, { target: { value: '2' } });
    setTimeout(() => {
      Simulate.blur(input);
      setTimeout(() => {
        expect(pagination.state.current).to.be(1);
        expect(current).to.be(1);
        done();
      }, 10);
    }, 10);
  });

  // https://github.com/ant-design/ant-design/issues/17763
  it('should not jump when blur input when there is not goButton', (done) => {
    ReactDOM.render(
      <Pagination pageSize={10} total={20} showQuickJumper />,
      container,
      function () {
        const quickJumper = TestUtils.findRenderedDOMComponentWithClass(
          this, 'rc-pagination-options-quick-jumper',
        );
        const input = quickJumper.querySelector('input');
        Simulate.change(input, { target: { value: '2' } });
        setTimeout(() => {
          Simulate.blur(input);
          setTimeout(() => {
            expect(this.state.current).to.be(2);
            done();
          }, 10);
        }, 10);
      },
    );
  });

  // https://github.com/ant-design/ant-design/issues/15539
  it('should hide quick jumper when only one page', (done) => {
    ReactDOM.render(
      <Pagination pageSize={10} total={10} showQuickJumper />,
      container,
      function () {
        expect(() => {
          TestUtils.findRenderedDOMComponentWithClass(this, 'rc-pagination-options-quick-jumper');
        }).to.throwException(/Did not find exactly one match/);
        done();
      },
    );
  });

  it('should display total items', (done) => {
    const totalText = TestUtils.findRenderedDOMComponentWithClass(
      pagination,
      'rc-pagination-total-text'
    );
    expect(TestUtils.isDOMComponent(totalText)).to.be(true);
    expect(totalText.innerHTML).to.be('1 - 10 of 25 items');
    const nextButton = TestUtils.findRenderedDOMComponentWithClass(
      pagination,
      'rc-pagination-next'
    );
    Simulate.click(nextButton);
    setTimeout(() => {
      expect(totalText.innerHTML).to.be('11 - 20 of 25 items');
      Simulate.click(nextButton);
      setTimeout(() => {
        expect(totalText.innerHTML).to.be('21 - 25 of 25 items');
        done();
      }, 10);
    }, 10);
  });
});

describe('Controlled Pagination', () => {
  let pagination = null;
  const container = document.createElement('div');
  document.body.appendChild(container);

  let current = 2;
  let pageSize;
  function onChange(page, pSize) {
    current = page;
    pageSize = pSize;
  }

  beforeEach((done) => {
    ReactDOM.render(
      <Pagination current={current} onChange={onChange} total={25} />,
      container,
      function () {
        pagination = this;
        done();
      }
    );
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
  });

  it('not replace currentInputValue if current not change', (done) => {
    pagination.state.current = 1;
    pagination.state.currentInputValue = 1;
    pagination.forceUpdate();
    expect(pagination.state.current).to.be(1);
    expect(pagination.state.currentInputValue).to.be(1);

    setTimeout(() => {
      pagination.state.currentInputValue = 1;
      pagination.forceUpdate();
      expect(pagination.state.current).to.be(2);
      expect(pagination.state.currentInputValue).to.be(1);

      done();
    }, 10);
  });

  it('current should equal defaultCurrent', () => {
    expect(pagination.state.current).to.be(2);
  });

  it('should not response mouse click', (done) => {
    const nextButton = TestUtils.findRenderedDOMComponentWithClass(
      pagination,
      'rc-pagination-next'
    );
    expect(TestUtils.isDOMComponent(nextButton)).to.be(true);
    Simulate.click(nextButton);
    setTimeout(() => {
      expect(pagination.state.current).to.be(2);
      expect(current).to.be(3);
      expect(pageSize).to.be(10);
      done();
    }, 10);
  });
});

describe('Two Pagination', () => {
  let entry = null;
  const container = document.createElement('div');
  document.body.appendChild(container);

  beforeEach((done) => {
    ReactDOM.render(<TwoPagination />, container, function () {
      entry = this;
      done();
    });
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
  });

  it('should has initial pageSize 20', () => {
    const p1 = TestUtils.scryRenderedComponentsWithType(entry, Pagination)[0];
    const p2 = TestUtils.scryRenderedComponentsWithType(entry, Pagination)[1];
    expect(p1.state.pageSize).to.be(20);
    expect(p2.state.pageSize).to.be(20);
  });

  it('should sync pageSize via state', (done) => {
    const p1 = TestUtils.scryRenderedComponentsWithType(entry, Pagination)[0];
    const p2 = TestUtils.scryRenderedComponentsWithType(entry, Pagination)[1];
    const hook = TestUtils.scryRenderedDOMComponentsWithClass(entry, 'hook')[0];
    Simulate.click(hook);
    setTimeout(() => {
      expect(p1.state.pageSize).to.be(50);
      expect(p2.state.pageSize).to.be(50);
      done();
    }, 100);
  });
});

describe('Other props', () => {
  let pagination;
  const currentPage = 12;
  const container = document.createElement('div');
  document.body.appendChild(container);

  const itemRender = (current) => {
    return <a href={`#${current}`}>{current}</a>;
  };

  beforeEach((done) => {
    ReactDOM.render(
      <Pagination
        total={1000}
        current={currentPage}
        itemRender={itemRender}
      />,
      container,
      function () {
        pagination = this;
        done();
      }
    );
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
  });

  it('should support custom itemRender', () => {
    const prev = TestUtils.findRenderedDOMComponentWithClass(
      pagination,
      'rc-pagination-prev'
    );
    const next = TestUtils.findRenderedDOMComponentWithClass(
      pagination,
      'rc-pagination-next'
    );
    const jumpPrev = TestUtils.findRenderedDOMComponentWithClass(
      pagination,
      'rc-pagination-jump-prev'
    );
    const jumpNext = TestUtils.findRenderedDOMComponentWithClass(
      pagination,
      'rc-pagination-jump-next'
    );
    const active = TestUtils.findRenderedDOMComponentWithClass(
      pagination,
      'rc-pagination-item-active'
    );
    expect(prev.innerHTML).to.be(`<a href="#${currentPage - 1}">${currentPage - 1}</a>`);
    expect(next.innerHTML).to.be(`<a href="#${currentPage + 1}">${currentPage + 1}</a>`);
    expect(jumpPrev.innerHTML).to.be(`<a href="#${currentPage - 5}">${currentPage - 5}</a>`);
    expect(jumpNext.innerHTML).to.be(`<a href="#${currentPage + 5}">${currentPage + 5}</a>`);
    expect(active.innerHTML).to.be(`<a href="#${currentPage}">${currentPage}</a>`);
  });
});

describe('Other props', () => {
  let pagination;
  const currentPage = 12;
  const container = document.createElement('div');
  document.body.appendChild(container);
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
  beforeEach((done) => {
    ReactDOM.render(
      <Pagination
        total={1000}
        current={currentPage}
        {...iconsProps}
      />,
      container,
      function () {
        pagination = this;
        done();
      }
    );
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
  });

  it('should support custom default icon', () => {
    const nextIconElement = TestUtils.findRenderedDOMComponentWithClass(
      pagination,
      'rc-pagination-next'
    );
    const prevIconElement = TestUtils.findRenderedDOMComponentWithClass(
      pagination,
      'rc-pagination-prev'
    );
    const jumpNextIconElement = TestUtils.findRenderedDOMComponentWithClass(
      pagination,
      'rc-pagination-jump-next'
    );
    const jumpPrevIconElement = TestUtils.findRenderedDOMComponentWithClass(
      pagination,
      'rc-pagination-jump-prev'
    );
    expect(nextIconElement.innerText).to.be('nextIcon');
    expect(prevIconElement.innerText).to.be('prevIcon');
    expect(jumpNextIconElement.innerText).to.be('jumpNextIcon');
    expect(jumpPrevIconElement.innerText).to.be('jumpPrevIcon');
  });
});

describe('hideOnSinglePage props', () => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const itemRender = (current) => {
    return <a href={`#${current}`}>{current}</a>;
  };

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
  });

  it('should hide pager if hideOnSinglePage equals true', (done) => {
    ReactDOM.render(
      <Pagination total={10} itemRender={itemRender} hideOnSinglePage />,
      container,
      function () {
        expect(() => {
          TestUtils.findRenderedDOMComponentWithClass(this, 'rc-pagination');
        }).to.throwException(/Did not find exactly one match/);
        done();
      }
    );
  });

  it('should show pager if hideOnSinglePage equals false', (done) => {
    ReactDOM.render(
      <Pagination total={10} itemRender={itemRender} hideOnSinglePage={false} />,
      container,
      function () {
        expect(() => {
          TestUtils.findRenderedDOMComponentWithClass(this, 'rc-pagination');
        }).to.not.throwException();
        done();
      }
    );
  });

  it('should show pager if hideOnSinglePage equals true but more than 1 page', (done) => {
    ReactDOM.render(
      <Pagination total={10} pageSize={5} itemRender={itemRender} hideOnSinglePage={false} />,
      container,
      function () {
        expect(() => {
          TestUtils.findRenderedDOMComponentWithClass(this, 'rc-pagination');
        }).to.not.throwException();
        done();
      }
    );
  });
});

describe('showPrevNextJumpers props', () => {
  const container = document.createElement('div');
  const currentPage = 12;
  document.body.appendChild(container);

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
  });

  it('should hide jump-prev, jump-next if showPrevNextJumpers equals false', (done) => {
    ReactDOM.render(
      <Pagination total={1000} current={currentPage} showPrevNextJumpers={false} />,
      container,
      function () {
        expect(() => {
          TestUtils.findRenderedDOMComponentWithClass(this, 'rc-pagination-jump-prev');
        }).to.throwException(/Did not find exactly one match/);
        expect(() => {
          TestUtils.findRenderedDOMComponentWithClass(this, 'rc-pagination-jump-next');
        }).to.throwException(/Did not find exactly one match/);
        done();
      }
    );
  });

  it('should show jump-prev, jump-next if showPrevNextJumpers equals true', (done) => {
    ReactDOM.render(
      <Pagination total={1000} current={currentPage} showPrevNextJumpers />,
      container,
      function () {
        const jumpPrev = TestUtils.findRenderedDOMComponentWithClass(
          this,
          'rc-pagination-jump-prev'
        );
        const jumpNext = TestUtils.findRenderedDOMComponentWithClass(
          this,
          'rc-pagination-jump-next'
        );
        expect(TestUtils.isDOMComponent(jumpPrev)).to.be(true);
        expect(TestUtils.isDOMComponent(jumpNext)).to.be(true);
        done();
      }
    );
  });
});

describe('custom showQuickJumper button Pagination', () => {
  let pagination = null;
  const container = document.createElement('div');
  document.body.appendChild(container);

  let current = 1;
  let pageSize;
  function onChange(page, pSize) {
    current = page;
    pageSize = pSize;
  }

  beforeEach((done) => {
    ReactDOM.render(
      <Pagination
        onChange={onChange}
        defaultCurrent={1}
        total={25}
        showQuickJumper={{ goButton: <button>go</button> }}
        showTotal={(total, range) => `${range[0]} - ${range[1]} of ${total} items`}
      />,
      container,
      function () {
        pagination = this;
        done();
      },
    );
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
  });

  it('should quick jump to expect page', (done) => {
    const quickJumper = TestUtils.findRenderedDOMComponentWithClass(
      pagination,
      'rc-pagination-options-quick-jumper'
    );
    const input = quickJumper.querySelector('input');
    const goButton = quickJumper.querySelector('button');
    expect(TestUtils.isDOMComponent(quickJumper)).to.be(true);
    expect(TestUtils.isDOMComponent(input)).to.be(true);
    expect(TestUtils.isDOMComponent(goButton)).to.be(true);
    input.value = '2';
    Simulate.change(input);
    setTimeout(() => {
      Simulate.click(goButton);
      setTimeout(() => {
        expect(pagination.state.current).to.be(2);
        expect(current).to.be(2);
        expect(pageSize).to.be(10);
        done();
      }, 10);
    }, 10);
  });

  // https://github.com/ant-design/ant-design/issues/10080
  it('should not quick jump to previous page when input invalid char', (done) => {
    const pager = TestUtils.findRenderedDOMComponentWithClass(
      pagination,
      'rc-pagination'
    );
    const nextButton = TestUtils.findRenderedDOMComponentWithClass(
      pagination,
      'rc-pagination-next'
    );
    Simulate.click(nextButton);
    const input = pager.querySelector('input');
    input.value = '&';
    Simulate.change(input);
    setTimeout(() => {
      Simulate.keyUp(input, { key: 'Enter', keyCode: 13, which: 13 });
      setTimeout(() => {
        expect(pagination.state.current).to.be(2);
        done();
      }, 10);
    }, 10);
  });
});


describe('simple Pagination', () => {
  let pagination = null;
  const container = document.createElement('div');
  document.body.appendChild(container);

  beforeEach((done) => {
    ReactDOM.render(
      <Pagination
        simple
        defaultCurrent={1}
        total={25}
        showTotal={(total, range) => `${range[0]} - ${range[1]} of ${total} items`}
      />,
      container,
      function () {
        pagination = this;
        done();
      },
    );
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
  });

  it('default current page is 1', () => {
    const current3 = pagination.state.current;
    expect(current3).to.be(1);
  });

  it('prev-button should be disabled', () => {
    const prevButton = TestUtils.findRenderedDOMComponentWithClass(
      pagination,
      'rc-pagination-prev'
    );
    expect(TestUtils.isDOMComponent(prevButton)).to.be(true);
    expect(prevButton.className).to.contain('rc-pagination-disabled');
    expect(prevButton.getAttribute('aria-disabled')).to.equal('true');
  });

  it('no quick jump', () => {
    const simplePagers = TestUtils.scryRenderedDOMComponentsWithClass(
      pagination,
      'rc-pagination-simple-pager'
    );
    expect(simplePagers.length).to.be(1);
  });
});


describe('simple Pagination with quick jump', () => {
  let pagination = null;
  const container = document.createElement('div');
  document.body.appendChild(container);

  let current = 1;
  let pageSize;
  function onChange(page, pSize) {
    current = page;
    pageSize = pSize;
  }

  beforeEach((done) => {
    ReactDOM.render(
      <Pagination
        simple
        onChange={onChange}
        defaultCurrent={1}
        total={25}
        showQuickJumper={{ goButton: <button>go</button> }}
        showTotal={(total, range) => `${range[0]} - ${range[1]} of ${total} items`}
      />,
      container,
      function () {
        pagination = this;
        done();
      },
    );
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
  });

  it('should quick jump to expect page', (done) => {
    const quickJumper = TestUtils.findRenderedDOMComponentWithClass(
      pagination,
      'rc-pagination-simple'
    );
    const input = quickJumper.querySelector('input');
    const goButton = quickJumper.querySelector('button');
    expect(TestUtils.isDOMComponent(quickJumper)).to.be(true);
    expect(TestUtils.isDOMComponent(input)).to.be(true);
    expect(TestUtils.isDOMComponent(goButton)).to.be(true);
    input.value = '2';
    Simulate.change(input);
    setTimeout(() => {
      Simulate.click(goButton);
      setTimeout(() => {
        expect(pagination.state.current).to.be(2);
        expect(current).to.be(2);
        expect(pageSize).to.be(10);
        done();
      }, 10);
    }, 10);
  });
});

// https://github.com/ant-design/ant-design/issues/10524
describe('current value on onShowSizeChange when total is 0', () => {
  let pagination = null;
  let changeCurrent = 0;
  const container = document.createElement('div');
  document.body.appendChild(container);

  const onShowSizeChange = (current) => {
    changeCurrent = current;
  };

  beforeEach((done) => {
    ReactDOM.render(
      <Pagination
        selectComponentClass={Select}
        showSizeChanger
        onShowSizeChange={onShowSizeChange}
        current={1}
        total={0}
        showTotal={(total, range) => `${range[0]} - ${range[1]} of ${total} items`}
      />,
      container,
      function () {
        pagination = this;
        done();
      },
    );
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
  });

  it('current should equal to the current in onShowSizeChange', (done) => {
    const sizeChanger = TestUtils.findRenderedDOMComponentWithClass(
      pagination,
      'rc-pagination-options-size-changer'
    );
    Simulate.click(sizeChanger);
    setTimeout(() => {
      const menu = sizeChanger.querySelector('.rc-select-selection');
      // Simulate to choose item of the drop down menu
      Simulate.keyDown(menu, { key: 'Down', keyCode: 40, which: 40 });
      setTimeout(() => {
        Simulate.keyDown(menu, { key: 'Enter', keyCode: 13, which: 13 });
        expect(pagination.state.current).to.be(changeCurrent);
        done();
      }, 10);
    }, 10);
  });

  it('when total is 0, pager should show and disabled', () => {
    const itemButton = TestUtils.findRenderedDOMComponentWithClass(
      pagination,
      'rc-pagination-item'
    );
    expect(TestUtils.isDOMComponent(itemButton)).to.be(true);
    expect(itemButton.className).to.contain('rc-pagination-item-disabled');
  });

  it('when total is 0, `from` and `to` should be 0', () => {
    const totalText = TestUtils.findRenderedDOMComponentWithClass(
      pagination,
      'rc-pagination-total-text'
    );
    expect(TestUtils.isDOMComponent(totalText)).to.be(true);
    expect(totalText.innerHTML).to.be('0 - 0 of 0 items');
  });
});

describe('data and aria props', () => {
  let pagination = null;
  const container = document.createElement('div');
  document.body.appendChild(container);

  describe('with simple prop', () => {
    beforeEach((done) => {
      ReactDOM.render(
        <Pagination
          simple
          data-test="test-id"
          data-id="12345"
          aria-labelledby="labelledby-id"
          aria-label="label-id"
          role="navigation"
        />,
        container,
        function () {
          pagination = this;
          done();
        },
      );
    });

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('renders data attributes', () => {
      expect(pagination.paginationNode.getAttribute('data-test')).to.be('test-id');
      expect(pagination.paginationNode.getAttribute('data-id')).to.be('12345');
    });

    it('renders aria attributes', () => {
      expect(pagination.paginationNode.getAttribute('aria-labelledby')).to.be('labelledby-id');
      expect(pagination.paginationNode.getAttribute('aria-label')).to.be('label-id');
    });

    it('renders role attribute', () => {
      expect(pagination.paginationNode.getAttribute('role')).to.be('navigation');
    });
  });

  describe('without simple prop', () => {
    beforeEach((done) => {
      ReactDOM.render(
        <Pagination
          data-test="test-id"
          data-id="12345"
          aria-labelledby="labelledby-id"
          aria-label="label-id"
          role="navigation"
        />,
        container,
        function () {
          pagination = this;
          done();
        },
      );
    });

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('renders data attributes', () => {
      expect(pagination.paginationNode.getAttribute('data-test')).to.be('test-id');
      expect(pagination.paginationNode.getAttribute('data-id')).to.be('12345');
    });

    it('renders aria attributes', () => {
      expect(pagination.paginationNode.getAttribute('aria-labelledby')).to.be('labelledby-id');
      expect(pagination.paginationNode.getAttribute('aria-label')).to.be('label-id');
    });

    it('renders role attribute', () => {
      expect(pagination.paginationNode.getAttribute('role')).to.be('navigation');
    });
  });
});

describe('disabled', () => {
  const container = document.createElement('div');
  document.body.appendChild(container);

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
  });

  it('full pagination', (done) => {
    ReactDOM.render(
      <Pagination
        selectComponentClass={Select}
        showQuickJumper={{ goButton: true }}
        showSizeChanger
        defaultPageSize={20}
        defaultCurrent={5}
        total={450}
        disabled
      />,
      container,
      function () {
        const pagination = this;

        // Root
        expect(
          TestUtils.findRenderedDOMComponentWithClass(
            pagination,
            'rc-pagination-disabled'
          )
        ).to.be.ok();

        expect(
          TestUtils.findRenderedDOMComponentWithTag(
            pagination,
            'input'
          )
        ).to.be.ok();

        expect(
          TestUtils.findRenderedComponentWithType(
            pagination,
            Select,
          ).props.disabled
        ).to.be.ok();

        expect(
          TestUtils.findRenderedDOMComponentWithTag(
            pagination,
            'input'
          ).disabled
        ).to.be.ok();

        expect(
          TestUtils.findRenderedDOMComponentWithTag(
            pagination,
            'button'
          ).disabled
        ).to.be.ok();

        done();
      },
    );
  });
});

describe('Pagination with jumper', () => {
  let pagination = null;
  const container = document.createElement('div');
  document.body.appendChild(container);

  let current = 10;
  function onChange(page) {
    current = page;
  }

  beforeEach((done) => {
    ReactDOM.render(
      <Pagination
        onChange={onChange}
        defaultCurrent={10}
        total={1000}
        showQuickJumper
      />,
      container,
      function () {
        pagination = this;
        done();
      },
    );
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    current = 10;
  });

  it('when input less than 1', (done) => {
    const quickJumper = TestUtils.findRenderedDOMComponentWithClass(
      pagination,
      'rc-pagination-options-quick-jumper'
    );
    const input = quickJumper.querySelector('input');
    expect(TestUtils.isDOMComponent(input)).to.be(true);
    input.value = '-1';
    Simulate.change(input);
    setTimeout(() => {
      Simulate.keyUp(input, { key: 'Enter', keyCode: 13, which: 13 });
      setTimeout(() => {
        expect(pagination.state.current).to.be(1);
        expect(current).to.be(1);
        done();
      }, 10);
    }, 10);
  });

  it('when input onBlur', (done) => {
    const quickJumper = TestUtils.findRenderedDOMComponentWithClass(
      pagination,
      'rc-pagination-options-quick-jumper'
    );
    const input = quickJumper.querySelector('input');
    expect(TestUtils.isDOMComponent(input)).to.be(true);
    Simulate.blur(input);
    setTimeout(() => {
      expect(pagination.state.current).to.be(10);
      expect(current).to.be(10);
      done();
    }, 10);
  });
});

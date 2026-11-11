import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import { setSiteInfo, resetSiteInfo } from '@/test/mockSiteInfo';

vi.mock('@/context/SiteInfoContext', () => import('@/test/mockSiteInfo').then((m) => m.contextModule));

const setup = () =>
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );

describe('Header', () => {
  afterEach(resetSiteInfo);

  it('keeps all menu links', () => {
    setup();
    ['공지사항', '설문조사', '대여 신청', '신청/대여 확인', '성심지도', '조직도', '단과대 및 학과', '2025 새길'].forEach((t) => {
      expect(screen.getByRole('link', { name: t })).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: '설문조사' })).toHaveAttribute('href', '/surveys');
    const saegil = screen.getByRole('link', { name: '2025 새길' });
    expect(saegil).toHaveAttribute('href', 'https://2025saegil.cukeng.kr');
    expect(saegil).toHaveAttribute('target', '_blank');
  });

  it('hamburger toggles panel', async () => {
    const user = userEvent.setup();
    const { container } = setup();
    const nav = container.querySelector('nav.main-nav');
    expect(nav).toHaveAttribute('data-open', 'false');
    const btn = screen.getByRole('button', { name: '메뉴 열기' });
    await user.click(btn);
    expect(nav).toHaveAttribute('data-open', 'true');
    expect(screen.getByRole('button', { name: '메뉴 닫기' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('selecting a link closes panel', async () => {
    const user = userEvent.setup();
    const { container } = setup();
    const nav = container.querySelector('nav.main-nav');
    await user.click(screen.getByRole('button', { name: '메뉴 열기' }));
    await user.click(within(nav).getByRole('link', { name: '조직도' }));
    expect(nav).toHaveAttribute('data-open', 'false');
  });

  it('moves focus into the panel on open and back to the hamburger on Esc', async () => {
    const user = userEvent.setup();
    const { container } = setup();
    const nav = container.querySelector('nav.main-nav');
    await user.click(screen.getByRole('button', { name: '메뉴 열기' }));
    expect(within(nav).getByRole('link', { name: '공지사항' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(nav).toHaveAttribute('data-open', 'false');
    expect(screen.getByRole('button', { name: '메뉴 열기' })).toHaveFocus();
  });

  it('returns focus to the hamburger when closed via a link or outside click', async () => {
    const user = userEvent.setup();
    const { container } = setup();
    const nav = container.querySelector('nav.main-nav');
    await user.click(screen.getByRole('button', { name: '메뉴 열기' }));
    await user.click(within(nav).getByRole('link', { name: '조직도' }));
    expect(screen.getByRole('button', { name: '메뉴 열기' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: '메뉴 열기' }));
    expect(within(nav).getByRole('link', { name: '공지사항' })).toHaveFocus();
    fireEvent.mouseDown(document.body);
    expect(nav).toHaveAttribute('data-open', 'false');
    expect(screen.getByRole('button', { name: '메뉴 열기' })).toHaveFocus();
  });

  it('Esc does nothing to focus when the panel is closed', async () => {
    const user = userEvent.setup();
    setup();
    const link = screen.getByRole('link', { name: '조직도' });
    link.focus();
    await user.keyboard('{Escape}');
    expect(link).toHaveFocus();
  });

  it('renders the external link from links.external', () => {
    setSiteInfo({ 'links.external': { label: '행사 사이트', url: 'https://event.example.com' } });
    setup();
    const link = screen.getByRole('link', { name: '행사 사이트' });
    expect(link).toHaveAttribute('href', 'https://event.example.com');
    expect(screen.queryByRole('link', { name: '2025 새길' })).toBeNull();
  });

  describe('hide on scroll (mobile)', () => {
    const scrollTo = (y) => {
      Object.defineProperty(window, 'scrollY', { value: y, writable: true, configurable: true });
      fireEvent.scroll(window);
    };
    afterEach(() => scrollTo(0));

    it('hides when scrolling down past the header and shows again when scrolling up', () => {
      const { container } = setup();
      const header = container.querySelector('header');
      expect(header).toHaveAttribute('data-hidden', 'false');
      scrollTo(300);
      expect(header).toHaveAttribute('data-hidden', 'true');
      scrollTo(250);
      expect(header).toHaveAttribute('data-hidden', 'false');
    });

    it('stays visible near the top and ignores tiny jitters', () => {
      const { container } = setup();
      const header = container.querySelector('header');
      scrollTo(40);
      expect(header).toHaveAttribute('data-hidden', 'false');
      scrollTo(300);
      scrollTo(297); // 손떨림 수준의 역방향은 무시
      expect(header).toHaveAttribute('data-hidden', 'true');
    });

    it('never hides while the mobile menu is open', async () => {
      const user = userEvent.setup();
      const { container } = setup();
      const header = container.querySelector('header');
      await user.click(screen.getByRole('button', { name: '메뉴 열기' }));
      scrollTo(400);
      expect(header).toHaveAttribute('data-hidden', 'false');
    });
  });

  describe('when rental.enabled is false', () => {

    it('renders 대여 신청 as a disabled, non-navigating item', async () => {
      setSiteInfo({ 'rental.enabled': false });
      const user = userEvent.setup();
      const { container } = setup();
      const item = screen.getByText('대여 신청').closest('a');
      expect(item).toHaveAttribute('aria-disabled', 'true');
      expect(item).toHaveAttribute('href', '#');
      expect(container.querySelector('a[href="/borrow"]')).toBeNull();
      expect(item).toHaveAttribute('title', '대여 신청은 현재 잠시 이용할 수 없습니다.');
      expect(item).toHaveClass('disabled-link');
      // 다른 대여 메뉴는 그대로 링크
      expect(screen.getByRole('link', { name: '신청/대여 확인' })).toHaveAttribute('href', '/check');

      // 모바일 패널에서 눌러도 이동/닫힘 없이 그대로 (기본 동작 차단)
      const nav = container.querySelector('nav.main-nav');
      await user.click(screen.getByRole('button', { name: '메뉴 열기' }));
      const click = new MouseEvent('click', { bubbles: true, cancelable: true });
      item.dispatchEvent(click);
      expect(click.defaultPrevented).toBe(true);
      await user.click(item);
      expect(nav).toHaveAttribute('data-open', 'true');
    });
  });
});

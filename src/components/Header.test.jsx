import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

const flags = vi.hoisted(() => ({ RENTAL_ENABLED: true }));
vi.mock('../config/features', () => ({
  get RENTAL_ENABLED() {
    return flags.RENTAL_ENABLED;
  },
}));

const setup = () =>
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );

describe('Header', () => {

  it('keeps all menu links', () => {
    setup();
    ['공지사항', '대여 신청', '신청/대여 확인', '성심지도', '조직도', '단과대 및 학과', '2025 새길'].forEach((t) => {
      expect(screen.getByRole('link', { name: t })).toBeInTheDocument();
    });
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

  describe('when RENTAL_ENABLED is false', () => {
    afterEach(() => {
      flags.RENTAL_ENABLED = true;
    });

    it('renders 대여 신청 as a disabled, non-navigating item', async () => {
      flags.RENTAL_ENABLED = false;
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

import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

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
});

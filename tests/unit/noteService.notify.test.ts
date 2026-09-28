import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NoteServiceImpl } from '../../src/services/NoteService';
import { SqliteNoteRepository } from '../../src/repositories/NoteRepository';
import { createDb } from '../../src/db/connection';
import { notify } from '../../src/services/notificationService';

// 🔴🟢 EJERCICIO 6 — Notificación al fijar (pinned: true).
// Se simula el módulo completo de notificationService con vi.mock y se
// verifica que createNote llame a notify(nota) solo cuando pinned es true.

vi.mock('../../src/services/notificationService', () => ({
  notify: vi.fn(),
  _getSentNotifications: vi.fn(),
  _clearSentNotifications: vi.fn(),
}));

describe('NoteService - notify (Ejercicio 6)', () => {
  let service: NoteServiceImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    const db = createDb(':memory:');
    const repo = new SqliteNoteRepository(db);
    service = new NoteServiceImpl(repo);
  });

  it('llama a notify() con la nota creada cuando pinned: true', () => {
    const note = service.createNote({ title: 'A', content: 'B', pinned: true });
    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith(note);
  });

  it('NO llama a notify() cuando pinned: false', () => {
    service.createNote({ title: 'A', content: 'B', pinned: false });
    expect(notify).not.toHaveBeenCalled();
  });

  it('NO llama a notify() cuando no se indica pinned', () => {
    service.createNote({ title: 'A', content: 'B' });
    expect(notify).not.toHaveBeenCalled();
  });
});

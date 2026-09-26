import { describe, it, expect, beforeEach } from 'vitest';
import { NoteServiceImpl } from '../../src/services/NoteService';
import { SqliteNoteRepository } from '../../src/repositories/NoteRepository';
import { createDb } from '../../src/db/connection';

describe('NoteService - deleteNote (Ejercicio 5)', () => {
  let repo: SqliteNoteRepository;
  let service: NoteServiceImpl;

  beforeEach(() => {
    repo = new SqliteNoteRepository(createDb(':memory:'));
    service = new NoteServiceImpl(repo);
  });

  it('devuelve true y la nota deja de existir si el id existe', () => {
    const created = repo.create({ title: 'Comprar pan', content: 'Antes de las 20hs' });

    const result = service.deleteNote(created.id);

    expect(result).toBe(true);
    expect(service.getNote(created.id)).toBeUndefined();
  });

  it('devuelve false si el id no existe', () => {
    expect(service.deleteNote(999)).toBe(false);
  });

  it('solo elimina la nota indicada', () => {
    const a = repo.create({ title: 'A', content: 'a' });
    const b = repo.create({ title: 'B', content: 'b' });

    service.deleteNote(a.id);

    expect(service.listNotes()).toEqual([b]);
  });
});
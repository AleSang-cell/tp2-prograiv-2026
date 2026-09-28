import { describe, it, expect, beforeEach } from 'vitest';
import { NoteServiceImpl } from '../../src/services/NoteService';
import { SqliteNoteRepository } from '../../src/repositories/NoteRepository';
import { createDb } from '../../src/db/connection';

describe('NoteService - getNote (Ejercicio 3)', () => {
  let repo: SqliteNoteRepository;
  let service: NoteServiceImpl;

  beforeEach(() => {
    repo = new SqliteNoteRepository(createDb(':memory:'));
    service = new NoteServiceImpl(repo);
  });

  it('devuelve la nota si el id existe', () => {
    const created = repo.create({ title: 'Comprar pan', content: 'Antes de las 20hs' });

    const note = service.getNote(created.id);

    expect(note).toEqual(created);
  });

  it('devuelve undefined si el id no existe', () => {
    expect(service.getNote(999)).toBeUndefined();
  });
});
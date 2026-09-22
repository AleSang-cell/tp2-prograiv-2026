import { describe, it, expect, beforeEach } from 'vitest';
import { NoteServiceImpl } from '../../src/services/NoteService';
import { SqliteNoteRepository } from '../../src/repositories/NoteRepository';
import { createDb } from '../../src/db/connection';

describe('NoteService - listNotes (Ejercicio 2)', () => {
  let repo: SqliteNoteRepository;
  let service: NoteServiceImpl;

  beforeEach(() => {
    repo = new SqliteNoteRepository(createDb(':memory:'));
    service = new NoteServiceImpl(repo);
  });

  it('devuelve un array vacío si no hay notas', () => {
    expect(service.listNotes()).toEqual([]);
  });

  it('devuelve todas las notas, en orden de creación', () => {
    repo.create({ title: 'A', content: 'a' });
    repo.create({ title: 'B', content: 'b', pinned: true });

    const notes = service.listNotes();

    expect(notes).toHaveLength(2);
    expect(notes.map(n => n.title)).toEqual(['A', 'B']);
    expect(notes[1].pinned).toBe(true);
  });
});
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NoteServiceImpl } from '../../src/services/NoteService';
import { SqliteNoteRepository } from '../../src/repositories/NoteRepository';
import { createDb } from '../../src/db/connection';
import { Note } from '../../src/models/Note';

// EJERCICIO 4 — updateNote es una actualizacion PARCIAL (patch):
// solo cambian los campos que vienen en el patch, el resto queda igual.
//
// Las notas de partida se crean directo con el repositorio (y no con
// service.createNote) para que este test dependa solo de updateNote.

describe('NoteService - updateNote (Ejercicio 4)', () => {
  let service: NoteServiceImpl;
  let repo: SqliteNoteRepository;
  let original: Note;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T10:00:00.000Z'));

    const db = createDb(':memory:');
    repo = new SqliteNoteRepository(db);
    service = new NoteServiceImpl(repo);
    original = repo.create({ title: 'Comprar pan', content: 'Antes de las 20hs' });

    // Avanzamos el reloj para poder distinguir createdAt de updatedAt.
    vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('si el patch trae solo title, cambia title y content queda igual', () => {
    const updated = service.updateNote(original.id, { title: 'Comprar facturas' });

    expect(updated).toBeDefined();
    expect(updated!.title).toBe('Comprar facturas');
    expect(updated!.content).toBe('Antes de las 20hs');
    expect(updated!.pinned).toBe(false);
  });

  it('si el patch trae solo content, cambia content y title queda igual', () => {
    const updated = service.updateNote(original.id, { content: 'Antes de las 21hs' });

    expect(updated!.title).toBe('Comprar pan');
    expect(updated!.content).toBe('Antes de las 21hs');
  });

  it('puede cambiar pinned sin tocar title ni content', () => {
    const updated = service.updateNote(original.id, { pinned: true });

    expect(updated!.pinned).toBe(true);
    expect(updated!.title).toBe('Comprar pan');
    expect(updated!.content).toBe('Antes de las 20hs');
  });

  it('puede cambiar varios campos a la vez', () => {
    const updated = service.updateNote(original.id, {
      title: 'Supermercado',
      content: 'Leche y huevos',
      pinned: true
    });

    expect(updated).toMatchObject({
      id: original.id,
      title: 'Supermercado',
      content: 'Leche y huevos',
      pinned: true
    });
  });

  it('mantiene id y createdAt, y actualiza updatedAt', () => {
    const updated = service.updateNote(original.id, { title: 'Otro titulo' });

    expect(updated!.id).toBe(original.id);
    expect(updated!.createdAt).toBe(original.createdAt);
    expect(updated!.updatedAt).toBe('2026-01-01T12:00:00.000Z');
    expect(updated!.updatedAt).not.toBe(original.updatedAt);
  });

  it('el cambio queda persistido (getNote/listNotes lo ven)', () => {
    service.updateNote(original.id, { content: 'Antes de las 21hs' });

    expect(repo.findById(original.id)!.content).toBe('Antes de las 21hs');
    expect(service.listNotes()[0].content).toBe('Antes de las 21hs');
  });

  it('solo modifica la nota indicada, no las demas', () => {
    const otra = repo.create({ title: 'Llamar al dentista', content: 'Turno de control' });

    service.updateNote(original.id, { title: 'Cambiado' });

    expect(repo.findById(otra.id)).toEqual(otra);
  });

  it('un patch vacio no cambia title, content ni pinned', () => {
    const updated = service.updateNote(original.id, {});

    expect(updated).toMatchObject({
      title: original.title,
      content: original.content,
      pinned: original.pinned
    });
  });

  it('ignora campos con valor undefined (no pisa el valor existente)', () => {
    const updated = service.updateNote(original.id, { title: undefined, content: 'Nuevo' });

    expect(updated!.title).toBe('Comprar pan');
    expect(updated!.content).toBe('Nuevo');
  });

  it('devuelve undefined si el id no existe', () => {
    expect(service.updateNote(9999, { title: 'X' })).toBeUndefined();
  });

  it('con un id inexistente no modifica ninguna nota', () => {
    service.updateNote(9999, { title: 'X' });

    expect(service.listNotes()).toEqual([original]);
  });
});
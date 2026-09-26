import { NoteRepository } from '../repositories/NoteRepository';
import { Note, NewNote, NotePatch } from '../models/Note';
import { notify } from './notificationService';

// Contrato fijo. Las rutas (src/routes/notes.ts) y los tests de la cátedra
// llaman a estos 5 métodos por su nombre exacto: no los renombren.
export interface NoteService {
  createNote(data: NewNote): Note;
  listNotes(): Note[];
  getNote(id: number): Note | undefined;
  updateNote(id: number, patch: NotePatch): Note | undefined;
  deleteNote(id: number): boolean;
}

export class NoteServiceImpl implements NoteService {
  constructor(private readonly repo: NoteRepository) {}

  createNote(data: NewNote): Note {
    // EJERCICIO 1: crear la nota en el repositorio y devolverla.
    // EJERCICIO 6: si `data.pinned` es true, notificar la creación de la
    // nota llamando a notify(nota) del módulo notificationService.
    const note = this.repo.create(data);
    if (data.pinned) {
      notify(note);
    }
    return note;
  }

  listNotes(): Note[] {
    // 🟢 EJERCICIO 2: esta función YA FUNCIONA.
    // No existe todavía el archivo tests/unit/noteService.list.test.ts:
    // escríbanlo ustedes cubriendo al menos "lista vacía" y "varias notas".
    return this.repo.findAll();
  }

  getNote(id: number): Note | undefined {
    return this.repo.findById(id);
  }

  updateNote(id: number, patch: NotePatch): Note | undefined {
     // EJERCICIO 4: actualizacion PARCIAL. Solo se aplican los campos que
     // vienen definidos en el patch; los que faltan (o vienen como
     // undefined) conservan su valor actual. Si el id no existe, el
     // repositorio devuelve undefined.
    const cambios: NotePatch = {};
    if (patch.title !== undefined) cambios.title = patch.title;
    if (patch.content !== undefined) cambios.content = patch.content;
    if (patch.pinned !== undefined) cambios.pinned = patch.pinned;

    return this.repo.update(id, cambios);
  }

  deleteNote(id: number): boolean {
    // 🔴🟢 EJERCICIO 5: ciclo completo.
    throw new Error('deleteNote: no implementado (Ejercicio 5)');
  }
}

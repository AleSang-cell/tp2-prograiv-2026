import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { makeApp } from '../../src/app';

describe('GET /notes (Ejercicio 2)', () => {
  let app: ReturnType<typeof makeApp>;
  beforeEach(() => { app = makeApp(':memory:'); });

  it('200 y [] si no hay notas', async () => {
    const res = await request(app).get('/notes');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('200 y la lista con las notas creadas', async () => {
    await request(app).post('/notes').send({ title: 'A', content: 'a' });
    await request(app).post('/notes').send({ title: 'B', content: 'b' });

    const res = await request(app).get('/notes');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('GET /notes/:id (Ejercicio 3)', () => {
  let app: ReturnType<typeof makeApp>;
  beforeEach(() => { app = makeApp(':memory:'); });

  it('200 y la nota si existe', async () => {
    const created = await request(app).post('/notes').send({ title: 'A', content: 'a' });

    const res = await request(app).get(`/notes/${created.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(created.body);
  });

  it('404 si el id no existe', async () => {
    const res = await request(app).get('/notes/999');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'NotFound' });
  });
});
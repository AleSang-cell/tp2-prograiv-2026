import { test, expect } from '@playwright/test';
import { resetAndSeed } from './helpers';

test.describe('Notes API - flujo E2E (Ejercicio 7)', () => {
  test.beforeEach(async ({ baseURL }) => {
    await resetAndSeed(baseURL!);
  });

  test('happy path: crear, leer, modificar, listar y eliminar una nota', async ({ request }) => {
    const createRes = await request.post('/notes', {
      data: { title: 'Estudiar testing', content: 'Repasar Playwright' }
    });
    expect(createRes.status()).toBe(201);
    const created = await createRes.json();
    expect(created).toMatchObject({ title: 'Estudiar testing', content: 'Repasar Playwright', pinned: false });

    const getRes = await request.get(`/notes/${created.id}`);
    expect(getRes.status()).toBe(200);
    expect(await getRes.json()).toEqual(created);

    const patchRes = await request.patch(`/notes/${created.id}`, {
      data: { content: 'Repasar Playwright y Supertest' }
    });
    expect(patchRes.status()).toBe(200);
    const updated = await patchRes.json();
    expect(updated.title).toBe('Estudiar testing');
    expect(updated.content).toBe('Repasar Playwright y Supertest');

    const listRes = await request.get('/notes');
    expect(listRes.status()).toBe(200);
    expect(await listRes.json()).toHaveLength(3);

    const deleteRes = await request.delete(`/notes/${created.id}`);
    expect(deleteRes.status()).toBe(204);

    const afterDeleteRes = await request.get(`/notes/${created.id}`);
    expect(afterDeleteRes.status()).toBe(404);
  });

  test('error: POST /notes sin title devuelve 400 y no crea la nota', async ({ request }) => {
    const res = await request.post('/notes', { data: { content: 'Sin titulo' } });

    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe('ValidationError');

    const listRes = await request.get('/notes');
    expect(await listRes.json()).toHaveLength(2);
  });
});
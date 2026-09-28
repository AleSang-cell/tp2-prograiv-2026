import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { makeApp } from '../../src/app';

describe('POST /notes (Ejercicio 1)', () => {
  let app: ReturnType<typeof makeApp>;
  beforeEach(() => { app = makeApp(':memory:'); });

  it('201: crea la nota y la devuelve con id, timestamps y pinned en false por defecto', async () => {
    const res = await request(app)
      .post('/notes')
      .send({ title: 'Comprar pan', content: 'Antes de las 20hs' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: 'Comprar pan',
      content: 'Antes de las 20hs',
      pinned: false
    });
    expect(res.body.id).toBeDefined();
    expect(res.body.createdAt).toBeDefined();
    expect(res.body.updatedAt).toBeDefined();
  });

  it('201: permite crear una nota ya fijada con pinned: true', async () => {
    const res = await request(app)
      .post('/notes')
      .send({ title: 'A', content: 'B', pinned: true });

    expect(res.status).toBe(201);
    expect(res.body.pinned).toBe(true);
  });

  it('la nota creada queda persistida: GET /notes/:id la devuelve', async () => {
    const created = await request(app).post('/notes').send({ title: 'A', content: 'B' });

    const res = await request(app).get(`/notes/${created.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(created.body);
  });

  it('400: sin title no pasa la validacion de Zod', async () => {
    const res = await request(app).post('/notes').send({ content: 'Sin titulo' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ValidationError');
  });

  it('400: sin content no pasa la validacion de Zod', async () => {
    const res = await request(app).post('/notes').send({ title: 'Sin contenido' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ValidationError');
  });

  it('400: title vacio no pasa la validacion de Zod', async () => {
    const res = await request(app).post('/notes').send({ title: '', content: 'a' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ValidationError');
  });

  it('400: pinned con tipo incorrecto no pasa la validacion de Zod', async () => {
    const res = await request(app).post('/notes').send({ title: 'A', content: 'B', pinned: 'si' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ValidationError');
  });

  it('400: una request invalida no crea la nota', async () => {
    await request(app).post('/notes').send({ content: 'Sin titulo' });

    const res = await request(app).get('/notes');
    expect(res.body).toEqual([]);
  });
});


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

describe('PATCH /notes/:id (Ejercicio 4)', () => {
  let app: ReturnType<typeof makeApp>;
  let id: number;

  beforeEach(async () => {
    app = makeApp(':memory:');
    const res = await request(app)
      .post('/notes')
      .send({ title: 'Comprar pan', content: 'Antes de las 20hs' });
    id = res.body.id;
  });

  it('200: actualiza solo content y deja title igual', async () => {
    const res = await request(app).patch(`/notes/${id}`).send({ content: 'Antes de las 21hs' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id,
      title: 'Comprar pan',
      content: 'Antes de las 21hs',
      pinned: false
    });
  });

  it('200: actualiza solo title y deja content igual', async () => {
    const res = await request(app).patch(`/notes/${id}`).send({ title: 'Comprar facturas' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Comprar facturas');
    expect(res.body.content).toBe('Antes de las 20hs');
  });

  it('200: puede fijar la nota con pinned: true', async () => {
    const res = await request(app).patch(`/notes/${id}`).send({ pinned: true });

    expect(res.status).toBe(200);
    expect(res.body.pinned).toBe(true);
  });

  it('el cambio queda persistido: GET /notes/:id devuelve la nota modificada', async () => {
    await request(app).patch(`/notes/${id}`).send({ content: 'Antes de las 21hs' });

    const res = await request(app).get(`/notes/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.content).toBe('Antes de las 21hs');
  });

  it('400: title vacio no pasa la validacion de Zod', async () => {
    const res = await request(app).patch(`/notes/${id}`).send({ title: '' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ValidationError');
  });

  it('400: pinned con tipo incorrecto no pasa la validacion de Zod', async () => {
    const res = await request(app).patch(`/notes/${id}`).send({ pinned: 'si' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ValidationError');
  });

  it('400: una request invalida no modifica la nota', async () => {
    await request(app).patch(`/notes/${id}`).send({ title: '', content: 'No deberia guardarse' });

    const res = await request(app).get(`/notes/${id}`);
    expect(res.body.title).toBe('Comprar pan');
    expect(res.body.content).toBe('Antes de las 20hs');
  });

  it('404: id inexistente', async () => {
    const res = await request(app).patch('/notes/9999').send({ title: 'X' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('NotFound');
  });
});

describe('DELETE /notes/:id (Ejercicio 5)', () => {
  let app: ReturnType<typeof makeApp>;
  let id: number;

  beforeEach(async () => {
    app = makeApp(':memory:');
    const res = await request(app).post('/notes').send({ title: 'Comprar pan', content: 'Antes de las 20hs' });
    id = res.body.id;
  });

  it('204 y cuerpo vacío si la nota existe', async () => {
    const res = await request(app).delete(`/notes/${id}`);

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });

  it('la nota eliminada ya no se puede obtener: GET devuelve 404', async () => {
    await request(app).delete(`/notes/${id}`);

    const res = await request(app).get(`/notes/${id}`);
    expect(res.status).toBe(404);
  });

  it('404 si el id no existe', async () => {
    const res = await request(app).delete('/notes/9999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'NotFound' });
  });
});
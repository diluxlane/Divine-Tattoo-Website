import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const code = await readFile(new URL('../supabase-config.js', import.meta.url), 'utf8');
async function config(response = {data: true, error: null}) {
  const calls = [];
  const context = vm.createContext({URL});
  const client = {rpc: async (...args) => { calls.push(args); return response; }};
  const dependency = new vm.SyntheticModule(['createClient'], function () {
    this.setExport('createClient', () => client);
  }, {context});
  const module = new vm.SourceTextModule(code, {context});
  await module.link(() => dependency);
  await module.evaluate();
  return {api: module.namespace, calls};
}

test('central image paths resolve only within Divine Tattoo storage', async () => {
  const {api} = await config();
  const path = `${api.CLIENT_ID}/example.jpg`;
  assert.equal(api.portfolioPath(`${api.SUPABASE_URL}/storage/v1/object/public/client-portfolio/${path}`), path);
});

test('foreign origins, buckets, tenants and encoded traversal are rejected', async () => {
  const {api} = await config();
  for (const url of [
    `https://example.com/storage/v1/object/public/client-portfolio/${api.CLIENT_ID}/a.jpg`,
    `${api.SUPABASE_URL}/storage/v1/object/public/portfolio/${api.CLIENT_ID}/a.jpg`,
    `${api.SUPABASE_URL}/storage/v1/object/public/client-portfolio/other-client/a.jpg`,
    `${api.SUPABASE_URL}/storage/v1/object/public/client-portfolio/${api.CLIENT_ID}/%2e%2e%2fa.jpg`,
    'javascript:alert(1)'
  ]) assert.throws(() => api.portfolioPath(url));
});

test('access check asks the server for the configured tenant', async () => {
  const {api, calls} = await config();
  assert.equal(await api.canManagePortfolio(), true);
  assert.equal(calls[0][0], 'is_client_member');
  assert.equal(calls[0][1].target_client_id, api.CLIENT_ID);
});

test('nonmembers and backend errors fail closed', async () => {
  for (const response of [{data:false,error:null},{data:null,error:{message:'unavailable'}},{data:'true',error:null}]) {
    const {api} = await config(response);
    assert.equal(await api.canManagePortfolio(), false);
  }
});

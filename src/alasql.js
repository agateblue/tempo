var _alasql = null
export async function getAlasql () {
  if (!_alasql) {
    _alasql = (await import(/* webpackChunkName: "alasql" */ "alasql")).default
  }
  return alasql
}
export default async function alasql (query, data) {
  let a = await getAlasql()
  return await a(query, data)
}

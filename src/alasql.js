export default async function alasql (query, data) {
  let a = (await import(/* webpackChunkName: "alasql" */ "alasql")).default
  return await a(query, data)
}

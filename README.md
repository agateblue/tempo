# tempo

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### Run a CouchDB server

```
docker run -e COUCHDB_USER=admin -e COUCHDB_PASSWORD=password -p 5984:5984 -v couchdbdata:/opt/couchdb/data couchdb:3
```

Then go to http://localhost:5984/_utils/#/_config and enable CORS.

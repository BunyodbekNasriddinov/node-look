const url = require("url");
const querystring = require("querystring");

class Express {
  constructor(req, res) {
    this.req = req;
    this.res = res;

    if (this.req.method != "GET") {
      this.req.body = new Promise((res, rej) => {
        let str = "";
        req.on("data", (chunk) => (str += chunk));
        req.on("end", async () => res(JSON.parse(str)));
      });
    }
  }

  get(route, callback) {
    let { query, pathname } = url.parse(this.req.url);
    this.req.query = querystring.parse(query);

    if (route == pathname && this.req.method == "GET") {
      callback(this.req, this.res);
    }
  }

  post(route, callback) {
    if (route == this.req.url && this.req.method == "POST") {
      callback(this.req, this.res);
    }
  }

  put(route, callback) {
    if (route == this.req.url && this.req.method == "PUT") {
      callback(this.req, this.res);
    }
  }

  delete(route, callback) {
    if (route == this.req.url && this.req.method == "DELETE") {
      callback(this.req, this.res);
    }
  }
}

module.exports = Express;

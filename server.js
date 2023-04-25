const http = require("http");
const Express = require("./lib/express");
const { read, write } = require("./utils/model");
const PORT = 5000;
const url = require("url");
const querystring = require("querystring");

function httpServer(req, res) {
  const app = new Express(req, res);

  // foods
  app.get("/foods", (req, res) => {
    const foods = read("foods");
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });

    res.end(JSON.stringify(foods));
  });

  /* users route 
    GET users
  */
  app.get("/users", () => {
    const users = read("users");

    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });

    res.end(JSON.stringify(users));
  });

  /*
    POST users (signup)
  */
  app.post("/users", async (req, res) => {
    req.on("end", async () => {
      try {
        const users = read("users");
        const { username, contact } = await req.body;

        if (users.find((user) => user.username == username)) {
          throw new Error("Invalid username");
        }

        /**
         * RegEx => 998901234567 uzb phone number validate
         * /[9]{2}[8][0-9]{2}[0-9]{7}/gm
         */
        const number = /[9]{2}[8][0-9]{2}[0-9]{7}/gm;

        if (!number.test(contact)) {
          throw new Error("Invalid phone number");
        }

        const newUser = {
          userId: users.at(-1)?.userId + 1 || 1,
          username,
          contact,
        };

        users.push(newUser);

        write("users", users);

        res.writeHead(201, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        });

        res.end(JSON.stringify({ status: 201, succes: true }));
      } catch (error) {
        res.writeHead(400, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        });

        res.end(JSON.stringify({ status: 400, message: error.message }));
      }
    });
  });

  /*
    orders route
    
    GET orders
  */
  app.get("/orders", async (req, res) => {
    const orders = read("orders");
    const foods = read('foods')
    console.log(req.query);

    const order = orders.filter((order) => order.userId == req.query.userId);

    

    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });

    res.end(JSON.stringify(order));
  });

  /*
    POST orders (buy food)
  */

  app.post("/orders", (req, res) => {
    req.on("end", () => {
      try {
        const orders = read("orders");

        res.writeHead(201, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        });

        res.writeHead(201, { "Content-Type": "application/json" });

        res.end(JSON.stringify({ status: 201, succes: true }));
      } catch (error) {
        res.writeHead(400, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        });

        res.end(JSON.stringify({ status: 400, message: error.message }));
      }
    });
  });
}

const server = http.createServer(httpServer);

server.listen(PORT, console.log(`Server ${PORT} da ishga tushdi...`));

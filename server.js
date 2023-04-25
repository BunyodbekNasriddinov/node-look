const http = require("http");
const Express = require("./lib/express");
const { read, write } = require("./utils/model");
const PORT = 5000;

function httpServer(req, res) {
  const app = new Express(req, res);

  // foods
  app.get("/foods", (req, res) => {
    const foods = read("foods");
    const { foodId } = req.query;
    const filteredFoods = foods.filter((food) => food.foodId == foodId);

    if (filteredFoods.length) {
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });

      res.end(JSON.stringify(filteredFoods));
    } else {
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });

      res.end(JSON.stringify(foods));
    }
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

    const result = orders.filter((order) => order.userId == req.query.userId);

    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });

    res.end(JSON.stringify(result));
  });

  /*
    POST orders (buy food)
  */

  app.post("/orders", (req, res) => {
    req.on("end", async () => {
      try {
        const orders = read("orders");
        const { userId, foodId, count } = await req.body;
        const findFood = orders.find((order) => order.foodId == foodId);

        if (findFood) {
          // console.log(orders);
          findFood.count += count;
          // console.log(orders);

          write("orders", orders);

          res.writeHead(201, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          });

          res.end(JSON.stringify({ status: 201, succes: true }));
        } else {
          orders.push({
            userId,
            foodId,
            count,
          });

          write("orders", orders);

          res.writeHead(201, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          });

          res.end(JSON.stringify({ status: 201, succes: true }));
        }
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

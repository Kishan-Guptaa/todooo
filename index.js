const express = require("express");
const app = express();
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve static frontend files

// Utility functions
function findIndex(arr, id) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].id === id) {
      return i;
    }
  }
  return -1;
}

function removeIndex(arr, index) {
  let newArray = [];
  for (let i = 0; i < arr.length; i++) {
    if (i !== index) {
      newArray.push(arr[i]);
    }
  }
  return newArray;
}

// API Endpoints
app.get("/todo", (req, res) => {
  fs.readFile("todos.json", "utf-8", function (err, data) {
    if (err) {
      return res.status(500).json({ error: "Failed to read todos file." });
    }
    res.json(JSON.parse(data));
  });
});

app.get("/todo/:id", (req, res) => {
  fs.readFile("todos.json", "utf-8", function (err, data) {
    if (err) {
      return res.status(500).json({ error: "Failed to read todos file." });
    }
    const todos = JSON.parse(data);
    const todoIndex = findIndex(todos, parseInt(req.params.id));
    if (todoIndex === -1) {
      return res.status(404).json({ error: "Todo not found." });
    } else {
      res.json(todos[todoIndex]);
    }
  });
});

app.post("/todo", (req, res) => {
  const newtodo = {
    id: Math.floor(Math.random() * 1000000),
    title: req.body.title,
    description: req.body.description,
    complete: false,
  };
  fs.readFile("todos.json", "utf-8", function (err, data) {
    if (err) {
      return res.status(500).json({ error: "Failed to read todos file." });
    }
    const todos = JSON.parse(data);
    todos.push(newtodo);
    fs.writeFile("todos.json", JSON.stringify(todos), function (err) {
      if (err) {
        return res.status(500).json({ error: "Failed to write to todos file." });
      }
      return res.status(201).json({
        msg: "Todo added successfully.",
        todo: newtodo,
      });
    });
  });
});

app.put("/todo/:id", function (req, res) {
  fs.readFile("todos.json", "utf-8", function (err, data) {
    if (err) {
      return res.status(500).json({ error: "Failed to read todos file." });
    }
    const todos = JSON.parse(data);
    const todoIndex = findIndex(todos, parseInt(req.params.id));
    if (todoIndex === -1) {
      return res.status(404).json({ error: "Todo not found." });
    } else {
      const updateTodo = {
        id: todos[todoIndex].id,
        title: req.body.title,
        description: req.body.description,
        complete: true, // Mark as completed
      };
      todos[todoIndex] = updateTodo;
      fs.writeFile("todos.json", JSON.stringify(todos), function (err) {
        if (err) {
          return res.status(500).json({ error: "Failed to update todo." });
        }
        return res.status(200).json({
          msg: "Todo updated successfully.",
          todo: updateTodo,
        });
      });
    }
  });
});

app.delete("/todo/:id", function (req, res) {
  fs.readFile("todos.json", "utf-8", function (err, data) {
    if (err) {
      return res.status(500).json({ error: "Failed to read todos file." });
    }
    let todos = JSON.parse(data);
    const todoindex = findIndex(todos, parseInt(req.params.id));
    if (todoindex === -1) {
      return res.status(404).json({ error: "Todo not found." });
    } else {
      todos = removeIndex(todos, todoindex);
      fs.writeFile("todos.json", JSON.stringify(todos), function (err) {
        if (err) {
          return res.status(500).json({ error: "Failed to delete todo." });
        }
        return res.status(200).json({
          msg: "Todo deleted successfully.",
        });
      });
    }
  });
});

// Serve index.html for base route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 404 handler
app.use((req, res) => {
  res.status(404).send({ msg: "Something went Wrong!" });
});

// Start server
app.listen(3000, function () {
  console.log("Server is listening on port 3000");
});

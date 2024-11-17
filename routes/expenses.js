const express = require("express");
const router = express.Router();
const Expense = require("../models/expense");
const AuthenticationMiddleware = require("../extensions/authentication");

// GET /Expenses/
router.get("/", AuthenticationMiddleware, async (req, res, next) => {
  let expenses = await Expense.find().sort([["name", "ascending"]]);
  res.render("expenses/index", { title: "Expense List", dataset: expenses, user: req.user });
});

// GET /Expenses/Add
router.get("/add", AuthenticationMiddleware, (req, res, next) => {
  res.render("expenses/add", { title: "Add a new Expense", user: req.user });
});

// POST /Expenses/Add
router.post("/add", AuthenticationMiddleware, async (req, res, next) => {
  let newExpense = new Expense({
    name: req.body.name,
    description: req.body.description,
    code: req.body.code,
  });
  await newExpense.save();
  res.redirect("/expenses");
});

module.exports = router;
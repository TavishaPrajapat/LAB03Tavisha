// Naming convention > controllers/routers are plural
// Import express and create router object
const express = require("express");
const router = express.Router();

// Import mongoose models
const Transaction = require("../models/transaction");
const Expense = require("../models/expense");  // Updated from 'Expense' to 'Expense'

// Import authentication middleware
const AuthenticationMiddleware = require("../extensions/authentication");

// Configure GET/POST handlers
// Path relative to the one configured in app.js > /transactions

// GET /transactions/
// Retrieve ALL transactions and sort by date
router.get("/", async (req, res, next) => {
  let transactions = await Transaction.find().sort([["date", "descending"]]);
  res.render("transactions/index", {
    title: "Budget Tracker",
    dataset: transactions,
    user: req.user,
  });
});

// GET /transactions/add
router.get("/add", AuthenticationMiddleware, async (req, res, next) => {
  let expenseList = await Expense.find().sort([["name", "ascending"]]);  
  res.render("transactions/add", {
    title: "Add a New Transaction",
    expenses: expenseList,  
    user: req.user,
  });
});

// POST /transactions/add
router.post("/add", AuthenticationMiddleware, async (req, res, next) => {
  // Create new transaction object with form data
  let newTransaction = new Transaction({
    location: req.body.location,
    amount: req.body.amount,
    category: req.body.category,  
    note: req.body.note,
    date: req.body.date,
  });
  await newTransaction.save();
  res.redirect("/transactions");
});

// GET /transactions/delete/_id
router.get("/delete/:_id", AuthenticationMiddleware, async (req, res, next) => {
  let transactionId = req.params._id;
  await Transaction.findByIdAndRemove({ _id: transactionId });
  res.redirect("/transactions");
});

// GET /transactions/edit/_id
router.get("/edit/:_id", AuthenticationMiddleware, async (req, res, next) => {
  let transactionId = req.params._id;
  let transactionData = await Transaction.findById(transactionId);
  let expenseList = await Expense.find().sort([["name", "ascending"]]);  
  res.render("transactions/edit", {
    title: "Edit Transaction",
    transaction: transactionData,
    expenses: expenseList,  
    user: req.user,
  });
});

// POST /transactions/edit/_id
router.post("/edit/:_id", AuthenticationMiddleware, async (req, res, next) => {
  let transactionId = req.params._id;
  await Transaction.findByIdAndUpdate(
    { _id: transactionId },
    {
        location: req.body.location,
      amount: req.body.amount,
      category: req.body.category, 
      note: req.body.note,
      date: req.body.date,
    }
  );
  res.redirect("/transactions");
});

// Export router object
module.exports = router;

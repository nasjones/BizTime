const db = require("../db");
const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");

router.get("/", async function (req, res, next) {
	try {
		const results = await db.query(`SELECT id, comp_code from invoices`);
		return res.json({ invoices: results.rows });
	} catch (error) {
		return next(error);
	}
});

router.get("/:id", async function (req, res, next) {
	try {
		const id = req.params.id;
		const results = await db.query(
			`SELECT id, amt, paid, add_date, paid_date, companies.code, companies.name, companies.description from invoices JOIN companies on comp_code = companies.code where id=$1 `,
			[id]
		);
		if (results.rows.length == 0)
			throw new ExpressError("No such company!", 404);
		return res.json({ invoice: results.rows[0] });
	} catch (error) {
		return next(error);
	}
});

router.post("/", async function (req, res, next) {
	try {
		const { comp_code, amt } = req.body;
		const results = await db.query(
			`INSERT INTO invoices (comp_code, amt) VALUES ($1,$2) RETURNING id, comp_code, amt, paid, add_date, paid_date`,
			[comp_code, amt]
		);
		return res.status(201).json({ invoice: results.rows[0] });
	} catch (error) {
		return next(error);
	}
});

router.put("/:id", async function (req, res, next) {
	try {
		const id = req.params.id;
		const { amt, paid } = req.body;

		const selectResults = await db.query(
			`SELECT id, amt, paid, add_date, paid_date, companies.code, companies.name, companies.description from invoices JOIN companies on comp_code = companies.code where id=$1 `,
			[id]
		);
		const invoice = selectResults.rows[0];
		let paid_date;

		if (!invoice.paid && paid)
			paid_date = new Date().toISOString().split("T")[0];
		else if (invoice.paid && !paid) paid_date = null;
		else paid_date = invoice.paid_date;

		const results = await db.query(
			`UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING id, comp_code, amt, paid, add_date, paid_date`,
			[amt, paid, paid_date, id]
		);

		if (results.rows.length == 0)
			throw new ExpressError("No such company!", 404);

		return res.json({ invoice: results.rows[0] });
	} catch (error) {
		return next(error);
	}
});

router.delete("/:id", async function (req, res, next) {
	try {
		const id = req.params.id;
		const results = await db.query(
			`DELETE FROM invoices WHERE id=$1 RETURNING id, comp_code, amt, paid, add_date, paid_date`,
			[id]
		);

		if (results.rows.length == 0)
			throw new ExpressError("No such company!", 404);

		return res.json({ status: "deleted" });
	} catch (error) {
		return next(error);
	}
});

module.exports = router;

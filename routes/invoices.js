const db = require("../db");
const express = require("express");
const router = new express.Router();

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
		const { amt } = req.body;
		const results = await db.query(
			`UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date`,
			[amt, id]
		);

		if (results.rows.length == 0)
			return res.status(404).json({ error: "No company found" });

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
			return res.status(404).json({ error: "No company found" });

		return res.json({ status: "deleted" });
	} catch (error) {
		return next(error);
	}
});
module.exports = router;

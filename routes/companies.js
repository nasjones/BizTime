const db = require("../db");
const express = require("express");
const router = new express.Router();

router.get("/", async function (req, res, next) {
	try {
		const results = await db.query(`SELECT code, name from companies`);
		return res.json({ companies: results.rows });
	} catch (error) {
		return next(error);
	}
});

router.get("/:code", async function (req, res, next) {
	try {
		const code = req.params.code;
		const results = await db.query(
			`SELECT code, name, description from companies where code=$1`,
			[code]
		);
		return res.json({ company: results.rows[0] });
	} catch (error) {
		return next(error);
	}
});

router.post("/", async function (req, res, next) {
	try {
		const { code, name, description } = req.body;
		const results = await db.query(
			`INSERT INTO companies (code, name, description) VALUES ($1,$2,$3)RETURNING code, name, description`,
			[code, name, description]
		);
		return res.status(201).json({ company: results.rows[0] });
	} catch (error) {
		return next(error);
	}
});

router.put("/:code", async function (req, res, next) {
	try {
		const code = req.params.code;
		const { name, description } = req.body;
		const results = await db.query(
			`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`,
			[name, description, code]
		);

		if (results.rows.length == 0)
			return res.status(404).json({ error: "No company found" });

		return res.json({ company: results.rows[0] });
	} catch (error) {
		return next(error);
	}
});

router.delete("/:code", async function (req, res, next) {
	try {
		const code = req.params.code;
		const results = await db.query(
			`DELETE FROM companies WHERE code=$1 RETURNING code, name, description`,
			[code]
		);

		if (results.rows.length == 0)
			return res.status(404).json({ error: "No company found" });

		return res.json({ status: "deleted" });
	} catch (error) {
		return next(error);
	}
});
module.exports = router;

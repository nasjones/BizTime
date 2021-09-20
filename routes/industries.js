const db = require("../db");
const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");

router.get("/", async function (req, res, next) {
	try {
		const results = await db.query(`SELECT code, industry from industries`);
		return res.json({ industries: results.rows });
	} catch (error) {
		return next(error);
	}
});

router.get("/:code", async function (req, res, next) {
	try {
		const code = req.params.code;
		const results = await db.query(
			`SELECT i.industry, i.code, c.name as companies from industries AS i 
			LEFT JOIN comp_industry as ci on ci.industry_code = i.code
			LEFT JOIN companies as c on ci.company_code = c.code
			where i.code=$1`,
			[code]
		);
		let dbInfo = results.rows;

		if (dbInfo.length == 0)
			throw new ExpressError("No such industry!", 404);
		console.log(dbInfo);
		let companies = dbInfo.map((row) => row.companies);

		return res.json({ industry: { ...dbInfo[0], companies } });
	} catch (error) {
		return next(error);
	}
});

router.post("/", async function (req, res, next) {
	try {
		const { code, industry } = req.body;
		const results = await db.query(
			`INSERT INTO industries (code, industry) VALUES ($1,$2) RETURNING code, industry`,
			[code, industry]
		);
		return res.status(201).json({ industry: results.rows[0] });
	} catch (error) {
		return next(error);
	}
});

module.exports = router;

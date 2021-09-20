const db = require("../db");
const express = require("express");
const router = new express.Router();
const slugify = require("slugify");
const ExpressError = require("../expressError");

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
			`SELECT c.code, c.name, c.description, i.industry from companies AS c 
			LEFT JOIN comp_industry as ci on ci.company_code = c.code
			LEFT JOIN industries as i on ci.industry_code = i.code
			where c.code=$1`,
			[code]
		);
		let dbInfo = results.rows;

		if (dbInfo.length == 0) throw new ExpressError("No such company!", 404);

		let industry = dbInfo.map((row) => row.industry);

		return res.json({ company: { ...dbInfo[0], industry } });
	} catch (error) {
		return next(error);
	}
});

router.post("/", async function (req, res, next) {
	try {
		const { name, description } = req.body;
		const code = name
			.split(" ")
			.map((word) =>
				slugify(word, {
					lower: true,
					strict: true,
					locale: "en",
					remove: "(?<!^)([aouie]|y(?![aouiey]))(?!$)",
				})
			)
			.join("-");
		const results = await db.query(
			`INSERT INTO companies (code, name, description) VALUES ($1,$2,$3) RETURNING code, name, description`,
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
			throw new ExpressError("No such company!", 404);

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
			throw new ExpressError("No such company!", 404);

		return res.json({ status: "deleted" });
	} catch (error) {
		return next(error);
	}
});
module.exports = router;

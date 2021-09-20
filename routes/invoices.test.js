process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testCompany;
let testInvoice;

beforeAll(async function () {
	let result = await db.query(
		`INSERT INTO companies (code, name, description) VALUES ($1,$2,$3) returning code, name, description`,
		["nas", "nasCo", "Created Nas"]
	);
	testCompany = result.rows[0];
});
beforeEach(async function () {
	let result = await db.query(
		`INSERT INTO invoices (comp_code, amt) VALUES ($1,$2) RETURNING id, comp_code, amt, paid, paid_date`,
		["nas", 200]
	);
	testInvoice = result.rows[0];
});

describe("GET /invoices", function () {
	test("Gets a list of 1 invoice", async function () {
		const response = await request(app).get(`/invoices`);
		expect(response.statusCode).toEqual(200);
		expect(response.body.invoices[0]).toEqual({
			id: testInvoice.id,
			comp_code: testInvoice.comp_code,
		});
	});
});

describe("GET /invoices/:id", function () {
	test("Gets 1 invoice", async function () {
		const response = await request(app).get(`/invoices/${testInvoice.id}`);
		expect(response.statusCode).toEqual(200);
		let { add_date, ...newBody } = response.body.invoice;
		let { comp_code, ...restInvoice } = testInvoice;
		expect(newBody).toEqual({
			...restInvoice,
			...testCompany,
		});
	});
});

describe("POST /invoices", function () {
	test("Posts 1 invoice", async function () {
		const response = await request(app).post(`/invoices`).send({
			comp_code: "nas",
			amt: 300,
		});

		expect(response.statusCode).toEqual(201);
		expect(response.body.invoice.amt).toEqual(300);
	});
});

describe("PUT /invoices", function () {
	test("Updates a company", async function () {
		const response = await request(app)
			.put(`/invoices/${testInvoice.id}`)
			.send({
				amt: 40,
				paid: false,
			});

		expect(response.statusCode).toEqual(200);
		let { add_date, ...newBody } = response.body.invoice;
		expect(newBody).toEqual({ ...testInvoice, amt: 40 });
	});
});

describe("DELETE /invoices", function () {
	test("Deletes an invoice", async function () {
		const response = await request(app).delete(
			`/invoices/${testInvoice.id}`
		);

		expect(response.statusCode).toEqual(200);
		expect(response.body).toEqual({
			status: "deleted",
		});
	});
});

afterEach(async function () {
	await db.query("DELETE FROM invoices");
});

afterAll(async function () {
	await db.query("DELETE FROM companies");
	await db.end();
});

process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testCompany;

beforeEach(async function () {
	let result = await db.query(
		`INSERT INTO companies (code, name, description) VALUES ($1,$2,$3) returning code, name, description`,
		["nas", "nasCo", "Created Nas"]
	);
	testCompany = result.rows[0];
});

describe("GET /companies", function () {
	test("Gets a list of 1 company", async function () {
		const response = await request(app).get(`/companies`);
		expect(response.statusCode).toEqual(200);
		expect(response.body).toEqual({
			companies: [{ code: testCompany.code, name: testCompany.name }],
		});
	});
});

describe("GET /companies/:code", function () {
	test("Gets a list of 1 company", async function () {
		const response = await request(app).get(`/companies/nas`);
		expect(response.statusCode).toEqual(200);
		expect(response.body).toEqual({
			company: testCompany,
		});
	});
});

describe("POST /companies", function () {
	test("Posts 1 company", async function () {
		const response = await request(app).post(`/companies`).send({
			name: "NewNas",
			description: "Created the newest nas",
		});

		expect(response.statusCode).toEqual(201);
		expect(response.body).toEqual({
			company: {
				code: "newnas",
				name: "NewNas",
				description: "Created the newest nas",
			},
		});
	});
});

describe("PUT /companies", function () {
	test("Updates a company", async function () {
		const response = await request(app).put(`/companies/nas`).send({
			name: "NewNas",
			description: "Updated the nas",
		});

		expect(response.statusCode).toEqual(200);
		expect(response.body).toEqual({
			company: {
				code: "nas",
				name: "NewNas",
				description: "Updated the nas",
			},
		});
	});
});

describe("DELETE /companies", function () {
	test("Deletes a company", async function () {
		const response = await request(app).delete(`/companies/nas`);

		expect(response.statusCode).toEqual(200);
		expect(response.body).toEqual({
			status: "deleted",
		});
	});
});

afterEach(async function () {
	await db.query("DELETE FROM companies");
});

afterAll(async function () {
	await db.end();
});

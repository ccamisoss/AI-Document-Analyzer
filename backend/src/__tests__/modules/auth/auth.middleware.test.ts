import request from "supertest";
import { createApp } from "../../../app.ts";
import * as documentsController from "../../../modules/documents/documents.controller.ts";

jest.mock("../../../modules/documents/documents.controller.ts", () => ({
  ...jest.requireActual("../../../modules/documents/documents.controller.ts"),
  getDocuments: jest.fn(),
}));

const { getDocuments } = documentsController;

describe("Authenticate middleware", () => {
  it("returns an error message when the token is invalid", async () => {
    const response = await request(createApp())
      .get("/documents")
      .set("Authorization", `Bearer randomtoken`);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: "warning",
      message: "Invalid or expired token",
    });
    expect(getDocuments).not.toHaveBeenCalled();
  });

  it("returns an error message when the authorization header is missing", async () => {
    const response = await request(createApp()).get("/documents");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: "warning",
      message: "Authorization header is required",
    });
    expect(getDocuments).not.toHaveBeenCalled();
  });
});

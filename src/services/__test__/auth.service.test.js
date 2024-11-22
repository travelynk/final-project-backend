import { describe, it, expect } from "@jest/globals";
import { login } from "../../services/auth.service.js";

describe("Auth Service", () => {
    it("should return null if user is not found", async () => {
        const user = null;
        const result = await login(user);
        expect(result).toBeNull();
    });

    it("should return token if user is found", async () => {
        const user = { username: "admin", password: "admin" };
        const result = await login(user);
        expect(result).toHaveProperty("token");
    });
});